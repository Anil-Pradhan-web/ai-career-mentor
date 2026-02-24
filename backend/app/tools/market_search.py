from duckduckgo_search import DDGS

def search_job_trends(role: str, location: str) -> str:
    """
    Searches the web for job market trends, salaries, top skills, 
    and hiring companies for a specific role and location using DuckDuckGo.
    """
    query = f"{role} job market trends salary top skills hiring companies in {location}"
    try:
        results = DDGS().text(query, max_results=3)
        
        formatted_results = []
        for res in results:
            formatted_results.append(f"Title: {res.get('title')}\nSnippet: {res.get('body')}")
            
        combined = "\n\n".join(formatted_results)
        
        # If no results (unlikely) or error didn't throw
        if not combined:
            return "No recent search results found. Make an educated guess based on your knowledge."
            
        return combined
    except Exception as e:
        return f"Error performing web search: {e}. Please use your internal knowledge to provide the JSON."
