"""支出リポジトリ"""
from datetime import datetime
from typing import Optional

import structlog
from google.cloud import firestore

from app.models.expense import ExpenseCreate, ExpenseModel

logger = structlog.get_logger(__name__)


class ExpenseRepository:
    """支出リポジトリ"""

    COLLECTION_NAME = "expenses"

    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection(self.COLLECTION_NAME)

    def get_all_by_user(self, user_id: str) -> list[ExpenseModel]:
        """ユーザーの全支出を取得"""
        try:
            docs = (
                self.collection.where("user_id", "==", user_id)
                .order_by("expense_date", direction=firestore.Query.DESCENDING)
                .stream()
            )
            expenses = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                expenses.append(ExpenseModel(**data))
            logger.info("get_all_by_user", user_id=user_id, count=len(expenses))
            return expenses
        except Exception as e:
            logger.error("get_all_by_user_failed", user_id=user_id, error=str(e))
            raise

    def get_monthly(
        self, user_id: str, year: int, month: int
    ) -> list[ExpenseModel]:
        """月次支出を取得"""
        try:
            # 月の開始と終了
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)

            docs = (
                self.collection.where("user_id", "==", user_id)
                .where("expense_date", ">=", start_date)
                .where("expense_date", "<", end_date)
                .order_by("expense_date", direction=firestore.Query.DESCENDING)
                .stream()
            )
            expenses = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                expenses.append(ExpenseModel(**data))
            logger.info(
                "get_monthly",
                user_id=user_id,
                year=year,
                month=month,
                count=len(expenses),
            )
            return expenses
        except Exception as e:
            logger.error(
                "get_monthly_failed",
                user_id=user_id,
                year=year,
                month=month,
                error=str(e),
            )
            raise

    def create(self, user_id: str, expense_data: ExpenseCreate) -> ExpenseModel:
        """支出を作成"""
        try:
            now = datetime.utcnow()
            doc_data = expense_data.model_dump()
            doc_data.update(
                {
                    "user_id": user_id,
                    "created_at": now,
                }
            )

            doc_ref = self.collection.document()
            doc_ref.set(doc_data)

            doc_data["id"] = doc_ref.id
            logger.info("expense_created", expense_id=doc_ref.id, user_id=user_id)
            return ExpenseModel(**doc_data)
        except Exception as e:
            logger.error("create_failed", user_id=user_id, error=str(e))
            raise
