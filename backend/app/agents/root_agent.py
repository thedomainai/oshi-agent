"""Root Agent - オーケストレーター"""
from typing import Any

import structlog

from app.agents.priority_agent import PriorityAgent
from app.agents.scout_agent import ScoutAgent
from app.external.gemini_client import GeminiClient
from app.repositories.info_repository import InfoRepository
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
    ):
        self.oshi_repo = oshi_repo
        self.scout_agent = scout_agent
        self.priority_agent = priority_agent
        self.gemini_client = gemini_client
        self.info_repo = info_repo

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

        Args:
            oshi_id: 推しID

        Returns:
            Scout結果 + サマリー
        """
        try:
            logger.info("root_scout_and_summarize_start", oshi_id=oshi_id)

            # 1. Scoutワークフローを実行
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
