import os
from typing import List, Optional
from pydantic import BaseModel


class SearchQuery(BaseModel):
    keywords: str
    location: Optional[str] = None
    search_type: str = "internship"  # internship, job, scholarship


class SearchResult(BaseModel):
    title: str
    company: str
    description: str
    url: str
    type: str
    location: Optional[str] = None
    posted_date: Optional[str] = None


async def search_opportunities(query: SearchQuery) -> List[SearchResult]:
    from firecrawl import FirecrawlApp
    
    app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))
    
    search_queries = {
        "internship": f"{query.keywords} internships {query.location or ''}",
        "job": f"{query.keywords} jobs entry level {query.location or ''}",
        "scholarship": f"{query.keywords} scholarships for students {query.location or ''}",
    }
    
    search_term = search_queries.get(query.search_type, query.keywords)
    
    try:
        response = app.search(
            query=search_term,
            limit=10
        )
        
        results = []
        if response and response.data:
            for item in response.data:
                results.append(SearchResult(
                    title=item.get("title", "Unknown"),
                    company=item.get("source", "Unknown"),
                    description=item.get("description", item.get("markdown", "")),
                    url=item.get("url", ""),
                    type=query.search_type,
                    location=query.location,
                    posted_date=item.get("published_date")
                ))
        
        return results
    except Exception as e:
        print(f"Firecrawl search error: {e}")
        return []
