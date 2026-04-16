import os
from typing import List, Optional
from pydantic import BaseModel


class SearchQuery(BaseModel):
    keywords: str
    location: Optional[str] = None
    search_type: str = "internship"  # internship, job, scholarship, hackathon, research


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

    # Extended search templates — aligned with problem statement categories
    search_queries = {
        "internship": f"{query.keywords} internship 2025 site:internshala.com OR site:linkedin.com OR site:unstop.com {query.location or ''}",
        "job": f"{query.keywords} entry level job fresher 2025 {query.location or ''}",
        "scholarship": f"{query.keywords} scholarship for engineering students India 2025 {query.location or ''}",
        "hackathon": f"{query.keywords} hackathon 2025 site:devfolio.co OR site:unstop.com OR site:hackerearth.com {query.location or ''}",
        "research": f"{query.keywords} research internship undergraduate IIT IISc 2025 {query.location or ''}",
    }

    search_term = search_queries.get(query.search_type, f"{query.keywords} {query.search_type}")

    try:
        response = app.search(query=search_term, limit=10)

        results = []
        if response and response.data:
            for item in response.data:
                results.append(
                    SearchResult(
                        title=item.get("title", "Unknown Opportunity"),
                        company=item.get("source", "Unknown Source"),
                        description=item.get("description", item.get("markdown", ""))[:600],
                        url=item.get("url", ""),
                        type=query.search_type,
                        location=query.location,
                        posted_date=item.get("published_date"),
                    )
                )

        return results
    except Exception as e:
        print(f"Firecrawl search error: {e}")
        return []
