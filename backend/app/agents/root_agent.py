"""Root Agent - オーケストレーター"""
from typing import Any, Optional

import structlog

from app.agents.priority_agent import PriorityAgent
from app.agents.scout_agent import ScoutAgent
from app.external.gemini_client import GeminiClient
from app.models.network_node import NetworkNodeCreate, NodeRing, NodeType
from app.repositories.info_repository import InfoRepository
from app.repositories.network_repository import NetworkRepository
from app.repositories.oshi_repository import OshiRepository

logger = structlog.get_logger(__name__)


class RootAgent:
    """全エージェントを統括するオーケストレーター"""

    def __init__(
        self,
        oshi_repo: OshiRepository,
        scout_agent: ScoutAgent,
        priority_agent: PriorityAgent,
        gemini_client: GeminiClient,
        info_repo: InfoRepository,
        network_repo: Optional[NetworkRepository] = None,
    ):
        self.oshi_repo = oshi_repo
        self.scout_agent = scout_agent
        self.priority_agent = priority_agent
        self.gemini_client = gemini_client
        self.info_repo = info_repo
        self.network_repo = network_repo

    async def run_scout_workflow(self, oshi_id: str) -> dict[str, Any]:
        """指定された推しのScoutワークフローを実行

        1. Scout Agent で情報収集
        2. Priority Agent で重要度判定

        Args:
            oshi_id: 推しID

        Returns:
            実行結果（収集件数、判定結果など）
        """
        try:
            logger.info(
                "root_scout_workflow_start",
                oshi_id=oshi_id,
            )

            # 推しを取得
            oshi = self.oshi_repo.get_by_id(oshi_id)
            if not oshi:
                raise ValueError(f"Oshi not found: {oshi_id}")

            # 1. Scout Agent: 情報収集
            new_info_ids = await self.scout_agent.collect_info(
                oshi_id=oshi.id,
                oshi_name=oshi.name,
                official_url=oshi.official_url,
                category=oshi.category,
            )

            # 2. Priority Agent: 重要度判定
            priority_results = {}
            if new_info_ids:
                priority_results = await self.priority_agent.judge_priority(
                    new_info_ids
                )

            result = {
                "oshi_id": oshi_id,
                "oshi_name": oshi.name,
                "collected_count": len(new_info_ids),
                "new_info_ids": new_info_ids,
                "priority_results": priority_results,
            }

            logger.info(
                "root_scout_workflow_success",
                oshi_id=oshi_id,
                collected_count=len(new_info_ids),
            )
            return result

        except Exception as e:
            logger.error(
                "root_scout_workflow_failed",
                oshi_id=oshi_id,
                error=str(e),
            )
            raise

    async def run_scout_and_summarize(self, oshi_id: str) -> dict[str, Any]:
        """Scout実行後にサマリーを生成するワークフロー

        推し登録直後に呼ばれ、初回の情報収集とサマリー生成を行う。
        ネットワーク発見も同時に実行する。

        Args:
            oshi_id: 推しID

        Returns:
            Scout結果 + サマリー + ネットワーク情報
        """
        try:
            logger.info("root_scout_and_summarize_start", oshi_id=oshi_id)

            # 0. ネットワーク自動発見（初回）
            network_result = None
            if self.network_repo:
                existing_nodes = self.network_repo.get_all_by_oshi(oshi_id)
                if not existing_nodes:
                    network_result = await self.discover_network(oshi_id)

            # 1. Scoutワークフローを実行（ネットワーク対応版）
            if self.network_repo:
                scout_result = await self.run_network_scout(oshi_id)
            else:
                scout_result = await self.run_scout_workflow(oshi_id)

            # 2. 収集された情報を取得してサマリー生成
            oshi = self.oshi_repo.get_by_id(oshi_id)
            if not oshi:
                raise ValueError(f"Oshi not found: {oshi_id}")

            infos = self.info_repo.get_all_by_oshi(oshi_id)
            infos_data = [
                {"title": info.title, "url": info.url, "snippet": info.snippet}
                for info in infos[:10]
            ]

            summary = self.gemini_client.generate_oshi_summary(
                oshi_name=oshi.name,
                infos=infos_data,
            )

            result = {
                **scout_result,
                "summary": summary,
            }
            if network_result:
                result["network"] = network_result

            logger.info(
                "root_scout_and_summarize_success",
                oshi_id=oshi_id,
                summary_length=len(summary),
            )
            return result

        except Exception as e:
            logger.error(
                "root_scout_and_summarize_failed",
                oshi_id=oshi_id,
                error=str(e),
            )
            raise

    async def discover_network(self, oshi_id: str) -> dict[str, Any]:
        """推しのネットワークを自動発見

        Gemini APIで推しに関連する人物・組織・情報源を特定し、
        ネットワークノードとしてDBに保存する。

        Args:
            oshi_id: 推しID

        Returns:
            発見結果（ノード数、ノード一覧）
        """
        try:
            logger.info("root_discover_network_start", oshi_id=oshi_id)

            if not self.network_repo:
                raise ValueError("NetworkRepository is not configured")

            oshi = self.oshi_repo.get_by_id(oshi_id)
            if not oshi:
                raise ValueError(f"Oshi not found: {oshi_id}")

            # Gemini でネットワークを発見
            raw_nodes = self.gemini_client.discover_network(
                oshi_name=oshi.name,
                category=oshi.category,
            )

            if not raw_nodes:
                logger.info("root_discover_network_no_results", oshi_id=oshi_id)
                return {
                    "oshi_id": oshi_id,
                    "oshi_name": oshi.name,
                    "discovered_count": 0,
                    "nodes": [],
                }

            # 既存ノードとの重複を排除して保存
            created_nodes = []
            for raw in raw_nodes:
                name = raw.get("name", "")
                if not name:
                    continue

                # 重複チェック
                existing = self.network_repo.find_by_name(oshi_id, name)
                if existing:
                    continue

                try:
                    node_type = NodeType(raw.get("node_type", "fan"))
                except ValueError:
                    node_type = NodeType.FAN_ACCOUNT

                try:
                    ring = NodeRing(raw.get("ring", 2))
                except ValueError:
                    ring = NodeRing.OUTER

                node_data = NetworkNodeCreate(
                    oshi_id=oshi_id,
                    name=name,
                    node_type=node_type,
                    ring=ring,
                    relationship=raw.get("relationship", "")[:200],
                    search_queries=raw.get("search_queries", []),
                )
                created = self.network_repo.create(node_data)
                created_nodes.append(created)

            result = {
                "oshi_id": oshi_id,
                "oshi_name": oshi.name,
                "discovered_count": len(created_nodes),
                "nodes": [
                    {
                        "id": n.id,
                        "name": n.name,
                        "node_type": n.node_type.value if hasattr(n.node_type, "value") else n.node_type,
                        "ring": n.ring.value if hasattr(n.ring, "value") else n.ring,
                        "relationship": n.relationship,
                    }
                    for n in created_nodes
                ],
            }

            logger.info(
                "root_discover_network_success",
                oshi_id=oshi_id,
                discovered_count=len(created_nodes),
            )
            return result

        except Exception as e:
            logger.error(
                "root_discover_network_failed",
                oshi_id=oshi_id,
                error=str(e),
            )
            raise

    async def run_network_scout(self, oshi_id: str) -> dict[str, Any]:
        """ネットワーク全体をスカウト

        1. ネットワークノード経由で情報収集
        2. 通常のスカウトも併せて実行
        3. Priority Agent で重要度判定

        Args:
            oshi_id: 推しID

        Returns:
            実行結果
        """
        try:
            logger.info("root_network_scout_start", oshi_id=oshi_id)

            oshi = self.oshi_repo.get_by_id(oshi_id)
            if not oshi:
                raise ValueError(f"Oshi not found: {oshi_id}")

            # 1. 通常のスカウト
            direct_ids = await self.scout_agent.collect_info(
                oshi_id=oshi.id,
                oshi_name=oshi.name,
                official_url=oshi.official_url,
                category=oshi.category,
            )

            # 2. ネットワークノード経由のスカウト
            network_ids = await self.scout_agent.collect_from_network(
                oshi_id=oshi.id,
                oshi_name=oshi.name,
            )

            all_new_ids = direct_ids + network_ids

            # 3. Priority Agent
            priority_results = {}
            if all_new_ids:
                priority_results = await self.priority_agent.judge_priority(
                    all_new_ids
                )

            result = {
                "oshi_id": oshi_id,
                "oshi_name": oshi.name,
                "direct_count": len(direct_ids),
                "network_count": len(network_ids),
                "total_count": len(all_new_ids),
                "new_info_ids": all_new_ids,
                "priority_results": priority_results,
            }

            logger.info(
                "root_network_scout_success",
                oshi_id=oshi_id,
                direct_count=len(direct_ids),
                network_count=len(network_ids),
            )
            return result

        except Exception as e:
            logger.error(
                "root_network_scout_failed",
                oshi_id=oshi_id,
                error=str(e),
            )
            raise

    async def run_all_scouts(self) -> dict[str, Any]:
        """全推しの情報収集を実行（Cloud Scheduler から呼ばれる）

        Returns:
            実行結果（推しごとの収集件数など）
        """
        try:
            logger.info("root_all_scouts_start")

            all_oshis = self.oshi_repo.get_all()

            results = []
            success_count = 0
            error_count = 0

            for oshi in all_oshis:
                try:
                    result = await self.run_scout_workflow(oshi.id)
                    results.append(result)
                    success_count += 1
                except Exception as e:
                    logger.error(
                        "root_all_scouts_oshi_failed",
                        oshi_id=oshi.id,
                        oshi_name=oshi.name,
                        error=str(e),
                    )
                    results.append({
                        "oshi_id": oshi.id,
                        "oshi_name": oshi.name,
                        "error": str(e),
                    })
                    error_count += 1

            result = {
                "total_oshis": len(all_oshis),
                "success_count": success_count,
                "error_count": error_count,
                "results": results,
            }

            logger.info(
                "root_all_scouts_success",
                total=len(all_oshis),
                success=success_count,
                errors=error_count,
            )
            return result

        except Exception as e:
            logger.error(
                "root_all_scouts_failed",
                error=str(e),
            )
            raise
