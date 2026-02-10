"""Priority Agent - 重要度判定エージェント"""
import structlog

from app.external.gemini_client import GeminiClient
from app.repositories.info_repository import InfoRepository

logger = structlog.get_logger(__name__)


class PriorityAgent:
    """情報の重要度を判定するエージェント"""

    def __init__(
        self,
        info_repo: InfoRepository,
        gemini_client: GeminiClient,
    ):
        self.info_repo = info_repo
        self.gemini_client = gemini_client

    async def judge_priority(self, info_ids: list[str]) -> dict[str, str]:
        """情報の重要度を判定

        Args:
            info_ids: 判定する情報IDのリスト

        Returns:
            {info_id: priority} の辞書
        """
        try:
            logger.info(
                "priority_judge_start",
                info_count=len(info_ids),
            )

            results = {}

            for info_id in info_ids:
                # 情報を取得
                info = self.info_repo.get_by_id(info_id)
                if not info:
                    logger.warning("priority_judge_info_not_found", info_id=info_id)
                    continue

                # Geminiで重要度判定
                priority = self.gemini_client.classify_priority(
                    title=info.title,
                    url=info.url,
                )

                # Firestoreを更新
                self.info_repo.update_priority(info_id, priority)

                results[info_id] = priority.value
                logger.info(
                    "priority_judged",
                    info_id=info_id,
                    priority=priority.value,
                )

            logger.info(
                "priority_judge_success",
                total_count=len(info_ids),
                judged_count=len(results),
            )
            return results

        except Exception as e:
            logger.error(
                "priority_judge_failed",
                info_count=len(info_ids),
                error=str(e),
            )
            raise
