# in backend/web_search.py
import os
from serpapi import GoogleSearch

def perform_search(query: str, serpapi_key: str = None):
    if not serpapi_key:
        serpapi_key = os.getenv("SERPAPI_API_KEY")

    if not serpapi_key:
        return "SerpAPI key not configured."

    try:
        params = {
            "q": query,
            "api_key": serpapi_key,
        }
        search = GoogleSearch(params)
        results = search.get_dict()

        snippets = []
        if "organic_results" in results:
            for result in results["organic_results"][:3]: 
                if "snippet" in result:
                    snippets.append(result["snippet"])

        return "\n".join(snippets) if snippets else "No web search results found."

    except Exception as e:
        print(f"Error calling SerpAPI: {e}")
        return "Error performing web search."