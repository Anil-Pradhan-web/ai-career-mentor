import os
import json
import requests
from loguru import logger

from app.core.config import settings

# -----------------------------------------------------------------------------
# Safe ChromaDB Import & Persistent Client
# -----------------------------------------------------------------------------
CHROMA_AVAILABLE = True
try:
    import chromadb
    from chromadb import EmbeddingFunction
    from chromadb.config import Settings
except ImportError:
    CHROMA_AVAILABLE = False
    class EmbeddingFunction:  # type: ignore
        pass
    logger.warning("'chromadb' package is not installed. Using lightweight in-memory fallback.")


# -----------------------------------------------------------------------------
# OpenRouter Remote Embedding Function (Zero local model download, Render-safe)
# -----------------------------------------------------------------------------
class OpenRouterEmbeddingFunction(EmbeddingFunction):
    """
    Embedding function that computes vectors remotely via OpenRouter API.
    Replaces local PyTorch/ONNX transformer models to eliminate 512MB RAM OOM crashes.
    """
    def __init__(self, api_key: str = None, base_url: str = None, model: str = None):
        self.api_key = api_key or settings.OPENROUTER_API_KEY
        self.base_url = base_url or settings.OPENROUTER_BASE_URL
        self.model = model or settings.OPENROUTER_EMBEDDING_MODEL

    def __call__(self, input: list[str]) -> list[list[float]]:
        if not self.api_key:
            return []
        try:
            resp = requests.post(
                f"{self.base_url}/embeddings",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://ai-career-mentor.vercel.app",
                    "X-Title": "AI Career Mentor",
                },
                json={
                    "model": self.model,
                    "input": input
                },
                timeout=30.0
            )
            if resp.status_code == 200:
                data = resp.json()
                return [item["embedding"] for item in data["data"]]
            logger.error(f"OpenRouter embedding error {resp.status_code}: {resp.text[:200]}")
            return []
        except Exception as e:
            logger.error(f"Failed to generate OpenRouter embeddings: {e}")
            return []


class RAGService:
    def __init__(self, db_path: str = "./chroma_db"):
        self.db_path = db_path
        self.client = None
        self.collection = None
        self.embedding_fn = None
        self.mock_db = []  # Fallback in-memory database
        
        if CHROMA_AVAILABLE:
            try:
                os.makedirs(db_path, exist_ok=True)
                self.client = chromadb.PersistentClient(
                    path=db_path,
                    settings=Settings(allow_reset=True)
                )
                self.embedding_fn = OpenRouterEmbeddingFunction() if settings.OPENROUTER_API_KEY else None
                self.collection = self.client.get_or_create_collection(
                    name="resource_kb",
                    embedding_function=self.embedding_fn
                )
                logger.info(f"Persistent ChromaDB initialized with OpenRouter remote embeddings at: {db_path}")
            except Exception as e:
                logger.warning(f"Failed to initialize ChromaDB at {db_path}: {e}. Retrying with temporary directory /tmp/chroma_db...")
                try:
                    alt_path = "/tmp/chroma_db"
                    os.makedirs(alt_path, exist_ok=True)
                    self.client = chromadb.PersistentClient(
                        path=alt_path,
                        settings=Settings(allow_reset=True)
                    )
                    self.embedding_fn = OpenRouterEmbeddingFunction() if settings.OPENROUTER_API_KEY else None
                    self.collection = self.client.get_or_create_collection(
                        name="resource_kb",
                        embedding_function=self.embedding_fn
                    )
                    self.db_path = alt_path
                    logger.info(f"Persistent ChromaDB initialized at: {alt_path}")
                except Exception as e2:
                    logger.error(f"Failed to initialize ChromaDB: {e2}. Falling back to in-memory matching.")
                    self.client = None

    def auto_seed(self):
        """
        Loads curated resources from the JSON seed database and indexes them.
        Runs once on container/server startup.
        """
        seed_file_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "data",
            "curated_resources.json"
        )
        
        if not os.path.exists(seed_file_path):
            logger.warning(f"Seed file not found at {seed_file_path}. Skipping auto-seeding.")
            return

        try:
            with open(seed_file_path, "r", encoding="utf-8") as f:
                resources = json.load(f)
        except Exception as e:
            logger.error(f"Failed to read seed file: {e}")
            return

        # Populating the Mock DB fallback always
        self.mock_db = resources
        logger.info(f"Loaded {len(resources)} curated resources into memory.")

        if self.client and self.collection and settings.OPENROUTER_API_KEY:
            try:
                count = self.collection.count()
                if count == len(resources):
                    logger.info(f"ChromaDB collection already contains all {count} items. Skipping seeding.")
                    return

                logger.info(f"Collection count ({count}) differs from curated resources count ({len(resources)}). Re-indexing database...")
                try:
                    self.client.delete_collection("resource_kb")
                except Exception:
                    pass
                self.collection = self.client.create_collection(
                    name="resource_kb",
                    embedding_function=self.embedding_fn
                )
                
                logger.info("Starting OpenRouter remote auto-seeding in ChromaDB...")
                
                texts = []
                metadatas = []
                ids = []

                for idx, res in enumerate(resources):
                    doc_content = f"Topic: {res['topic']} | Title: {res['title']}"
                    texts.append(doc_content)
                    
                    metadatas.append({
                        "topic": res["topic"],
                        "youtube_url": res.get("youtube_url", ""),
                        "article_url": res.get("article_url", ""),
                        "github_url": res.get("github_url", ""),
                        "doc_url": res.get("doc_url", "")
                    })
                    ids.append(f"res_id_{idx}")

                # Batch add in chunks to avoid single payload limits
                batch_size = 50
                for i in range(0, len(texts), batch_size):
                    self.collection.add(
                        documents=texts[i : i + batch_size],
                        metadatas=metadatas[i : i + batch_size],
                        ids=ids[i : i + batch_size]
                    )
                logger.info(f"Successfully indexed {len(texts)} gold-standard resources in ChromaDB via OpenRouter!")
            except Exception as e:
                logger.error(f"Error seeding ChromaDB: {e}. Fallback database is ready.")
        else:
            logger.info("Auto-seeding: In-memory fallback indexing active.")

    def query_similarity(self, query_text: str, n_results: int = 1) -> list:
        """
        Queries the Vector DB for similar topics.
        If ChromaDB is disabled or fails, it falls back to a smart keyword-based search.
        """
        query_text_lower = query_text.lower()
        
        # 1. If ChromaDB is Active with OpenRouter embeddings, use Vector Cosine Search
        if self.client and self.collection and settings.OPENROUTER_API_KEY:
            try:
                results = self.collection.query(
                    query_texts=[query_text],
                    n_results=n_results
                )
                
                formatted = []
                if results and "documents" in results and results["documents"]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0] if results["metadatas"] else [{}] * len(docs)
                    distances = results["distances"][0] if "distances" in results else [0.0] * len(docs)
                    
                    for doc, meta, dist in zip(docs, metas, distances):
                        similarity = round(1.0 - dist, 4)
                        formatted.append({
                            "content": doc,
                            "metadata": meta,
                            "similarity_score": similarity
                        })
                return formatted
            except Exception as e:
                logger.error(f"ChromaDB query failed: {e}. Falling back to semantic lookup.")

        # 2. Fallback Smart Keyword Semantic Matcher (Zero Dependencies)
        matches = []
        for res in self.mock_db:
            score = 0
            topic_words = res["topic"].lower().split()
            title_words = res["title"].lower().split()
            
            for word in topic_words + title_words:
                if len(word) > 3 and word in query_text_lower:
                    score += 5
            
            if res["topic"].lower() in query_text_lower or query_text_lower in res["topic"].lower():
                score += 15

            if score > 0:
                matches.append((score, res))

        matches = sorted(matches, key=lambda x: x[0], reverse=True)
        
        formatted_fallback = []
        for score, res in matches[:n_results]:
            formatted_fallback.append({
                "content": f"Topic: {res['topic']} | Title: {res['title']}",
                "metadata": {
                    "topic": res["topic"],
                    "youtube_url": res.get("youtube_url", ""),
                    "article_url": res.get("article_url", ""),
                    "github_url": res.get("github_url", ""),
                    "doc_url": res.get("doc_url", "")
                },
                "similarity_score": round(min(1.0, 0.5 + (score / 40)), 2)
            })
            
        return formatted_fallback

# Initialize global engine
rag_engine = RAGService()
