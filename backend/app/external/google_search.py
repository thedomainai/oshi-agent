"""Google Custom Search APIクライアント"""
from typing import Any

import structlog
from googleapiclient.discovery import build
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

logger = structlog.get_logger(__name__)


class GoogleSearchClient:
    """Google Custom Search APIクライアント"""

    def __init__(self):
        self.api_key = settings.google_search_api_key
        self.cx = settings.google_search_cx
        self.service = build("customsearch", "v1", developerKey=self.api_key)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def search(self, query: str, num_results: int = 10) -> list[dict[str, Any]]:
        """Google検索を実行

        Args:
            query: 検索クエリ
            num_results: 取得する結果数（最大10）

        Returns:
            検索結果のリスト（title, link, snippetを含む辞書）
        """
        try:
            logger.info("google_search_start", query=query, num_results=num_results)

            # Custom Search APIは1リクエストで最大10件
            num_results = min(num_results, 10)

            result = (
                self.service.cse()
                .list(q=query, cx=self.cx, num=num_results)
                .execute()
            )

            items = result.get("items", [])
            search_results = []

            for item in items:
                search_results.append(
                    {
                        "title": item.get("title", ""),
                        "link": item.get("link", ""),
                        "snippet": item.get("snippet", ""),
                    }
                )

            logger.info(
                "google_search_success",
                query=query,
                results_count=len(search_results),
            )
            return search_results

        except Exception as e:
            logger.error("google_search_failed", query=query, error=str(e))
            raise
