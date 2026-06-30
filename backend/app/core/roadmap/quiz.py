"""
Roadmap Quiz — LLM-powered quiz generation and hardcoded fallback quizzes.
"""
from loguru import logger

from app.core.roadmap.prompts import QUIZ_SYSTEM_PROMPT


def get_fallback_quiz(topic: str) -> list[dict]:
    """Generates 5 fallback MCQs based on simple keyword matching or general engineering."""
    topic_lower = topic.lower()
    if "sql" in topic_lower or "database" in topic_lower or "query" in topic_lower:
        return [
            {
                "question": "Which of the following database indexes is most suitable for range queries?",
                "options": [
                    "A. Hash Index",
                    "B. B-Tree Index",
                    "C. Full-text Index",
                    "D. Bitmap Index"
                ],
                "answer": "B"
            },
            {
                "question": "What is the primary purpose of database normalization?",
                "options": [
                    "A. To increase query performance by duplicating data",
                    "B. To reduce data redundancy and improve data integrity",
                    "C. To encrypt sensitive data fields",
                    "D. To automatically generate primary keys"
                ],
                "answer": "B"
            },
            {
                "question": "Which isolation level prevents dirty reads but allows non-repeatable reads?",
                "options": [
                    "A. Read Uncommitted",
                    "B. Read Committed",
                    "C. Repeatable Read",
                    "D. Serializable"
                ],
                "answer": "B"
            },
            {
                "question": "What does the 'A' in ACID transaction properties represent?",
                "options": [
                    "A. Atomicity",
                    "B. Availability",
                    "C. Authority",
                    "D. Aggregation"
                ],
                "answer": "A"
            },
            {
                "question": "Which SQL JOIN returns all records when there is a match in either left or right table?",
                "options": [
                    "A. INNER JOIN",
                    "B. LEFT JOIN",
                    "C. RIGHT JOIN",
                    "D. FULL OUTER JOIN"
                ],
                "answer": "D"
            }
        ]
    elif "api" in topic_lower or "http" in topic_lower or "rest" in topic_lower or "graphql" in topic_lower:
        return [
            {
                "question": "Which HTTP status code is most appropriate when a client sends a request but lacks valid authentication credentials?",
                "options": [
                    "A. 400 Bad Request",
                    "B. 401 Unauthorized",
                    "C. 403 Forbidden",
                    "D. 404 Not Found"
                ],
                "answer": "B"
            },
            {
                "question": "What is an advantage of GraphQL over REST APIs?",
                "options": [
                    "A. GraphQL automatically caches all responses at the browser level",
                    "B. GraphQL allows clients to request only the specific fields they need, reducing payload size",
                    "C. GraphQL is faster because it does not use HTTP",
                    "D. GraphQL does not require any server-side schemas"
                ],
                "answer": "B"
            },
            {
                "question": "Which HTTP method is designed to be idempotent and is typically used to update an existing resource completely?",
                "options": [
                    "A. POST",
                    "B. PUT",
                    "C. PATCH",
                    "D. DELETE"
                ],
                "answer": "B"
            },
            {
                "question": "Which HTTP header is commonly used to negotiate the media type of the response?",
                "options": [
                    "A. Content-Type",
                    "B. Accept",
                    "C. User-Agent",
                    "D. Authorization"
                ],
                "answer": "B"
            },
            {
                "question": "In HTTP, what does the 301 Status Code represent?",
                "options": [
                    "A. Found (Temporary Redirect)",
                    "B. Moved Permanently",
                    "C. Bad Gateway",
                    "D. Unauthorized"
                ],
                "answer": "B"
            }
        ]
    elif "docker" in topic_lower or "container" in topic_lower or "kubernetes" in topic_lower or "deployment" in topic_lower or "ci/cd" in topic_lower:
        return [
            {
                "question": "What is the main difference between a container and a virtual machine (VM)?",
                "options": [
                    "A. Containers virtualize the underlying hardware, whereas VMs share the host kernel",
                    "B. Containers share the host OS kernel and are lightweight, while VMs run a full guest OS",
                    "C. Virtual machines boot faster than containers",
                    "D. Containers cannot be run locally without cloud providers"
                ],
                "answer": "B"
            },
            {
                "question": "In Docker, what is the purpose of multi-stage builds?",
                "options": [
                    "A. To run multiple containers simultaneously from a single command",
                    "B. To reduce the final image size by discarding intermediate build dependencies",
                    "C. To automatically scale containers based on load",
                    "D. To execute tests in different operating systems"
                ],
                "answer": "B"
            },
            {
                "question": "What is the role of a Pod in Kubernetes?",
                "options": [
                    "A. It represents the smallest deployable unit, containing one or more containers",
                    "B. It is a cluster-level load balancer",
                    "C. It acts as a database storage engine",
                    "D. It compiles source code into Docker images"
                ],
                "answer": "A"
            },
            {
                "question": "What Docker command is used to remove unused containers, networks, and images?",
                "options": [
                    "A. docker clean",
                    "B. docker system prune",
                    "C. docker remove all",
                    "D. docker kill"
                ],
                "answer": "B"
            },
            {
                "question": "In Kubernetes, which component is responsible for maintaining the desired state of pods?",
                "options": [
                    "A. kube-apiserver",
                    "B. etcd",
                    "C. Controller Manager",
                    "D. kube-scheduler"
                ],
                "answer": "C"
            }
        ]
    else:
        # Generate hash of topic to dynamically rotate fallback questions
        topic_hash = sum(ord(char) for char in topic)
        pool_index = topic_hash % 4

        q1 = {
            "question": f"Which of the following best describes the core concept behind {topic} implementation?",
            "options": [
                "A. Focusing on immediate delivery without automated tests",
                "B. Writing modular, readable, and well-tested code that adheres to industry standards",
                "C. Minimizing comments and documentation to reduce file sizes",
                "D. Using as many third-party dependencies as possible to save time"
            ],
            "answer": "B"
        }

        if pool_index == 0:
            return [
                q1,
                {
                    "question": "Which design pattern is best suited for decoupling the sender of a request from its receiver?",
                    "options": [
                        "A. Singleton Pattern",
                        "B. Observer/Pub-Sub Pattern",
                        "C. Decorator Pattern",
                        "D. Factory Pattern"
                    ],
                    "answer": "B"
                },
                {
                    "question": "What is the main benefit of writing Unit Tests in a software project?",
                    "options": [
                        "A. It guarantees that the code has zero bugs in production",
                        "B. It allows developers to verify individual components in isolation and catch regressions early",
                        "C. It replaces the need for integrations and end-to-end testing",
                        "D. It speeds up the initial coding phase by bypassing code reviews"
                    ],
                    "answer": "B"
                },
                {
                    "question": "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
                    "options": [
                        "A. O(1)",
                        "B. O(N)",
                        "C. O(log N)",
                        "D. O(N log N)"
                    ],
                    "answer": "C"
                },
                {
                    "question": "Which of the following is a SOLID design principle represented by the letter 'L'?",
                    "options": [
                        "A. Liskov Substitution Principle",
                        "B. Least Privilege Principle",
                        "C. Loose Coupling Principle",
                        "D. Linear State Principle"
                    ],
                    "answer": "A"
                }
            ]
        elif pool_index == 1:
            return [
                q1,
                {
                    "question": "What is the primary difference between a process and a thread?",
                    "options": [
                        "A. Processes share memory space, while threads run in isolated memory spaces",
                        "B. Threads share memory space within the same process, while processes have isolated memory spaces",
                        "C. Processes are faster to create and destroy than threads",
                        "D. Threads cannot perform execution concurrently"
                    ],
                    "answer": "B"
                },
                {
                    "question": "What is the main advantage of using connection pooling for database connections?",
                    "options": [
                        "A. It automatically indexes the database queries",
                        "B. It reduces latency by reusing pre-established database connections instead of opening new ones",
                        "C. It encrypts all queries sent to the database",
                        "D. It guarantees that the database will never crash under load"
                    ],
                    "answer": "B"
                },
                {
                    "question": "Which of the following describes a 'race condition' in a multi-threaded application?",
                    "options": [
                        "A. Multiple threads competing for the lowest CPU usage",
                        "B. A situation where the output depends on the non-deterministic order of thread execution",
                        "C. When a thread runs faster than the main program loop",
                        "D. When two threads are locked waiting for each other to release resources"
                    ],
                    "answer": "B"
                },
                {
                    "question": "In software performance tuning, what is the primary focus of 'profiling'?",
                    "options": [
                        "A. Scanning code for syntax errors and warnings",
                        "B. Measuring memory and CPU usage of functions to identify performance bottlenecks",
                        "C. Writing automated unit tests for every public function",
                        "D. Securing application endpoints against unauthorized access"
                    ],
                    "answer": "B"
                }
            ]
        elif pool_index == 2:
            return [
                q1,
                {
                    "question": "What is the primary difference between integration testing and unit testing?",
                    "options": [
                        "A. Unit testing runs slower than integration testing",
                        "B. Integration testing verifies interaction between multiple components, while unit testing isolates one component",
                        "C. Integration testing only runs on production servers",
                        "D. Unit testing is performed by QA teams, while integration testing is done by developers"
                    ],
                    "answer": "B"
                },
                {
                    "question": "What does Continuous Integration (CI) primarily involve in modern software pipelines?",
                    "options": [
                        "A. Deploying the application to production manually once a month",
                        "B. Automatically building and running the test suite whenever code changes are pushed",
                        "C. Generating API documentation directly from source code comments",
                        "D. Restricting code access to senior developers only"
                    ],
                    "answer": "B"
                },
                {
                    "question": "Which Git operation integrates changes from a source branch into a target branch by reapplying commits?",
                    "options": [
                        "A. git checkout",
                        "B. git rebase",
                        "C. git clone",
                        "D. git push"
                    ],
                    "answer": "B"
                },
                {
                    "question": "What is the main purpose of a 'canary deployment' in software release management?",
                    "options": [
                        "A. To backup database contents before upgrading servers",
                        "B. To release the update to a small fraction of users first to verify stability",
                        "C. To run automated load tests against local machines",
                        "D. To keep older versions of the API active indefinitely"
                    ],
                    "answer": "B"
                }
            ]
        else:
            return [
                q1,
                {
                    "question": "Which data structure operates on a Last-In, First-Out (LIFO) basis?",
                    "options": [
                        "A. Queue",
                        "B. Stack",
                        "C. Linked List",
                        "D. Binary Tree"
                    ],
                    "answer": "B"
                },
                {
                    "question": "What is the average-case time complexity of the Quicksort sorting algorithm?",
                    "options": [
                        "A. O(N)",
                        "B. O(N log N)",
                        "C. O(N^2)",
                        "D. O(log N)"
                    ],
                    "answer": "B"
                },
                {
                    "question": "What is a 'hash collision' in data structures?",
                    "options": [
                        "A. When a hash table runs out of memory",
                        "B. When two different keys produce the same hash value",
                        "C. When the hashing function returns a negative integer",
                        "D. When keys are stored in a sorted array instead of buckets"
                    ],
                    "answer": "B"
                },
                {
                    "question": "In graph theory, which algorithm is typically used to find the shortest path in a weighted graph with non-negative edge weights?",
                    "options": [
                        "A. Kruskal's Algorithm",
                        "B. Dijkstra's Algorithm",
                        "C. Binary Search",
                        "D. Merge Sort"
                    ],
                    "answer": "B"
                }
            ]


async def generate_quiz(topic: str, is_beginner: bool, provider: str = None) -> list[dict]:
    """
    Generate 5 MCQs for the given topic via LLM. Falls back to hardcoded quizzes on failure.
    """
    import asyncio
    from typing import Optional
    from app.agents.registry import parse_json
    from app.core import llm_client

    user_content = f"Generate 5 MCQs for the topic: {topic}\nCandidate Experience Level: {'Beginner' if is_beginner else 'Intermediate/Advanced'}"
    try:
        raw_result = await asyncio.to_thread(
            llm_client.run_quiz_generation,
            system_prompt=QUIZ_SYSTEM_PROMPT,
            user_content=user_content,
        )
        if raw_result:
            parsed = parse_json(raw_result if isinstance(raw_result, str) else str(raw_result))
            
            # If the response is wrapped in a JSON object, extract the questions array
            if isinstance(parsed, dict):
                for key in ("questions", "quiz", "mcqs", "questions_list"):
                    if key in parsed and isinstance(parsed[key], list):
                        parsed = parsed[key]
                        break
                        
            if isinstance(parsed, list) and len(parsed) == 5:
                # Basic validation of keys
                valid = True
                for item in parsed:
                    if not isinstance(item, dict) or "question" not in item or "options" not in item or "answer" not in item:
                        valid = False
                        break
                    if not isinstance(item["options"], list) or len(item["options"]) != 4:
                        valid = False
                        break
                    if item["answer"] not in ("A", "B", "C", "D"):
                        valid = False
                        break
                if valid:
                    return parsed

            logger.warning(f"LLM quiz generation returned invalid structure, using fallback. Topic: {topic}")
    except Exception as e:
        import traceback
        from app.core.observability import track_error
        track_error(
            f"Error calling LLM for quiz generation for topic '{topic}': {e}",
            traceback_str=traceback.format_exc()
        )
        logger.error("Error calling LLM for quiz generation: {}", str(e))

    # Fallback path
    return get_fallback_quiz(topic)
