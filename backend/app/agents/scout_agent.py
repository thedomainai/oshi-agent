"""Scout Agent - 情報収集エージェント"""
from typing import Optional

import structlog

from app.external.google_search import GoogleSearchClient
from app.models.info import CollectedInfoCreate
from app.repositories.info_repository import InfoRepository
from app.repositories.oshi_repository import OshiRepository

logger = structlog.get_logger(__name__)


class ScoutAgent:
    """推しの情報を自律的に収集するエージェント"""

    def __init__(
        self,
        oshi_repo: OshiRepository,
        info_repo: InfoRepository,
        search_client: GoogleSearchClient,
    ):
        self.oshi_repo = oshi_repo
        self.info_repo = info_repo
        self.search_client = search_client

    async def collect_info(
        self, oshi_id: str, oshi_name: str, official_url: Optional[str] = None
    ) -> list[str]:
        """推しの情報を収集

        Args:
            oshi_id: 推しID
            oshi_name: 推しの名前
            official_url: 公式URL（検索クエリに含める）

        Returns:
            新規に作成された情報IDのリスト
        """
        try:
            logger.info(
                "scout_collect_start",
                oshi_id=oshi_id,
                oshi_name=oshi_name,
            )

            # 検索クエリを構築
            query = f"{oshi_name} 最新情報"
            if official_url:
                query += f" OR site:{official_url}"

            # Google検索を実行
            search_results = self.search_client.search(query, num_results=10)

            if not search_results:
                logger.info("scout_collect_no_results", oshi_id=oshi_id)
                return []

            # URL重複チェックと保存
            new_info_ids = []
            for result in search_results:
                url = result["link"]
                title = result["title"]
                snippet = result.get("snippet")

                # 既存チェック
                existing = self.info_repo.find_by_url(oshi_id, url)
                if existing:
                    logger.debug(
                        "scout_skip_duplicate",
                        oshi_id=oshi_id,
                        url=url,
                    )
                    continue

                # 新規作成
                info_data = CollectedInfoCreate(
                    title=title,
                    url=url,
                    snippet=snippet,
                    oshi_id=oshi_id,
                )
                created_info = self.info_repo.create(info_data)
                new_info_ids.append(created_info.id)

            logger.info(
                "scout_collect_success",
                oshi_id=oshi_id,
                new_count=len(new_info_ids),
                total_results=len(search_results),
            )
            return new_info_ids

        except Exception as e:
            logger.error(
                "scout_collect_failed",
                oshi_id=oshi_id,
                error=str(e),
            )
            raise
