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

    # カテゴリ別の追加検索キーワード
    CATEGORY_KEYWORDS: dict[str, list[str]] = {
        "アイドル": ["ライブ チケット", "イベント 握手会"],
        "アーティスト": ["ライブ チケット", "新曲 アルバム"],
        "声優": ["イベント チケット", "出演 アニメ"],
        "アニメ": ["放送 配信", "グッズ 発売"],
        "俳優": ["舞台 チケット", "ドラマ 映画 出演"],
        "お笑い": ["ライブ チケット", "テレビ 出演"],
        "スポーツ": ["試合 チケット", "大会 出場"],
        "VTuber": ["配信 コラボ", "グッズ 発売"],
    }

    def _build_queries(
        self,
        oshi_name: str,
        category: Optional[str] = None,
        official_url: Optional[str] = None,
    ) -> list[str]:
        """カテゴリに応じた検索クエリリストを生成"""
        queries = [f"{oshi_name} 最新情報"]

        # カテゴリ別キーワードで追加クエリ
        if category:
            keywords = self.CATEGORY_KEYWORDS.get(category, [])
            for kw in keywords:
                queries.append(f"{oshi_name} {kw}")

        # 公式URL がある場合は site: クエリを追加
        if official_url:
            queries.append(f"site:{official_url}")

        return queries

    async def collect_info(
        self,
        oshi_id: str,
        oshi_name: str,
        official_url: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[str]:
        """推しの情報を収集

        Args:
            oshi_id: 推しID
            oshi_name: 推しの名前
            official_url: 公式URL（検索クエリに含める）
            category: カテゴリ（検索キーワード最適化に使用）

        Returns:
            新規に作成された情報IDのリスト
        """
        try:
            logger.info(
                "scout_collect_start",
                oshi_id=oshi_id,
                oshi_name=oshi_name,
                category=category,
            )

            # カテゴリに応じた検索クエリを構築
            queries = self._build_queries(oshi_name, category, official_url)

            # 複数クエリで検索して結果をマージ
            search_results = []
            seen_urls = set()
            for query in queries:
                results = self.search_client.search(query, num_results=10)
                for r in results:
                    url = r.get("link", "")
                    if url not in seen_urls:
                        seen_urls.add(url)
                        search_results.append(r)

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
