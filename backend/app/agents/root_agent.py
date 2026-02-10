"""Root Agent - オーケストレーター"""
from typing import Any

import structlog

from app.agents.priority_agent import PriorityAgent
from app.agents.scout_agent import ScoutAgent
from app.repositories.oshi_repository import OshiRepository

logger = structlog.get_logger(__name__)


class RootAgent:
    """全エージェントを統括するオーケストレーター"""

    def __init__(
        self,
        oshi_repo: OshiRepository,
        scout_agent: ScoutAgent,
        priority_agent: PriorityAgent,
    ):
        self.oshi_repo = oshi_repo
        self.scout_agent = scout_agent
        self.priority_agent = priority_agent

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

    async def run_all_scouts(self) -> dict[str, Any]:
        """全推しの情報収集を実行

        Returns:
            実行結果（推しごとの収集件数など）
        """
        try:
            logger.info("root_all_scouts_start")

            # TODO: 全ユーザーの全推しを取得する実装
            # 現在はシンプルに実装（user_idが必要）
            # Cloud Schedulerから定期実行する際は、別途実装が必要

            result = {
                "message": "全推しスキャンは未実装です。各ユーザーの推しIDを指定してください。",
                "total_oshis": 0,
                "results": [],
            }

            logger.info("root_all_scouts_success")
            return result

        except Exception as e:
            logger.error(
                "root_all_scouts_failed",
                error=str(e),
            )
            raise
