"""Budget Agent - 予算管理エージェント"""
from collections import defaultdict
from typing import Any

import structlog

from app.external.gemini_client import GeminiClient
from app.models.expense import ExpenseCategory
from app.repositories.expense_repository import ExpenseRepository

logger = structlog.get_logger(__name__)


class BudgetAgent:
    """予算管理を行うエージェント"""

    def __init__(
        self,
        expense_repo: ExpenseRepository,
        gemini_client: GeminiClient,
    ):
        self.expense_repo = expense_repo
        self.gemini_client = gemini_client

    async def generate_report(
        self, user_id: str, year: int, month: int
    ) -> dict[str, Any]:
        """月次予算レポートを生成

        Args:
            user_id: ユーザーID
            year: 年
            month: 月

        Returns:
            レポートデータ（カテゴリ別集計、合計、アドバイス）
        """
        try:
            logger.info(
                "budget_report_start",
                user_id=user_id,
                year=year,
                month=month,
            )

            # 月次支出データを取得
            expenses = self.expense_repo.get_monthly(user_id, year, month)

            if not expenses:
                logger.info(
                    "budget_report_no_data",
                    user_id=user_id,
                    year=year,
                    month=month,
                )
                return {
                    "year": year,
                    "month": month,
                    "total": 0,
                    "by_category": {},
                    "expenses_count": 0,
                    "advice": "この月の支出データがありません。",
                }

            # カテゴリ別集計
            by_category = defaultdict(int)
            for expense in expenses:
                by_category[expense.category.value] += expense.amount

            total = sum(by_category.values())

            # Geminiでアドバイス生成
            expenses_summary = [
                {
                    "category": expense.category.value,
                    "amount": expense.amount,
                    "description": expense.description,
                    "date": expense.expense_date.strftime("%Y-%m-%d"),
                }
                for expense in expenses[:20]  # 最大20件
            ]

            advice = self.gemini_client.generate_budget_advice(
                expenses=expenses_summary,
                budget=None,  # 予算機能は将来拡張
            )

            report = {
                "year": year,
                "month": month,
                "total": total,
                "by_category": dict(by_category),
                "expenses_count": len(expenses),
                "advice": advice,
            }

            logger.info(
                "budget_report_success",
                user_id=user_id,
                year=year,
                month=month,
                total=total,
                expenses_count=len(expenses),
            )
            return report

        except Exception as e:
            logger.error(
                "budget_report_failed",
                user_id=user_id,
                year=year,
                month=month,
                error=str(e),
            )
            raise
