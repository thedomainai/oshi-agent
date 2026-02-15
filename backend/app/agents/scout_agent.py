"""Scout Agent - 情報収集エージェント"""
from typing import Optional

import structlog

from app.external.google_search import GoogleSearchClient
from app.models.info import CollectedInfoCreate
from app.models.network_node import NetworkNodeModel
from app.repositories.info_repository import InfoRepository
from app.repositories.network_repository import NetworkRepository
from app.repositories.oshi_repository import OshiRepository

logger = structlog.get_logger(__name__)


class ScoutAgent:
    """推しの情報を自律的に収集するエージェント"""

    def __init__(
        self,
        oshi_repo: OshiRepository,
        info_repo: InfoRepository,
        search_client: GoogleSearchClient,
        network_repo: Optional[NetworkRepository] = None,
    ):
        self.oshi_repo = oshi_repo
        self.info_repo = info_repo
        self.search_client = search_client
        self.network_repo = network_repo

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

    async def collect_from_network(
        self,
        oshi_id: str,
        oshi_name: str,
    ) -> list[str]:
        """ネットワークノード経由で情報を収集

        推しのネットワーク内のアクティブなノードそれぞれの検索クエリを使い、
        ノード単位で情報を収集する。

        Args:
            oshi_id: 推しID
            oshi_name: 推しの名前

        Returns:
            新規に作成された情報IDのリスト
        """
        if not self.network_repo:
            logger.warning("network_repo_not_available", oshi_id=oshi_id)
            return []

        try:
            logger.info(
                "scout_network_collect_start",
                oshi_id=oshi_id,
                oshi_name=oshi_name,
            )

            nodes = self.network_repo.get_active_by_oshi(oshi_id)
            if not nodes:
                logger.info("scout_network_no_nodes", oshi_id=oshi_id)
                return []

            all_new_ids = []
            seen_urls: set[str] = set()

            for node in nodes:
                node_results = self._search_node(node, oshi_name, seen_urls)
                for result in node_results:
                    url = result["link"]
                    title = result["title"]
                    snippet = result.get("snippet")

                    # 既存チェック
                    existing = self.info_repo.find_by_url(oshi_id, url)
                    if existing:
                        continue

                    info_data = CollectedInfoCreate(
                        title=title,
                        url=url,
                        snippet=snippet,
                        oshi_id=oshi_id,
                        source_node=node.name,
                    )
                    created_info = self.info_repo.create(info_data)
                    all_new_ids.append(created_info.id)

                # 最終検索日時を更新
                self.network_repo.update_last_searched(node.id)

            logger.info(
                "scout_network_collect_success",
                oshi_id=oshi_id,
                node_count=len(nodes),
                new_count=len(all_new_ids),
            )
            return all_new_ids

        except Exception as e:
            logger.error(
                "scout_network_collect_failed",
                oshi_id=oshi_id,
                error=str(e),
            )
            raise

    def _search_node(
        self,
        node: NetworkNodeModel,
        oshi_name: str,
        seen_urls: set[str],
    ) -> list[dict]:
        """ノード単体の検索を実行"""
        results = []
        queries = node.search_queries
        if not queries:
            queries = [f"{oshi_name} {node.name}"]

        for query in queries:
            search_results = self.search_client.search(query, num_results=5)
            for r in search_results:
                url = r.get("link", "")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    results.append(r)

        return results
