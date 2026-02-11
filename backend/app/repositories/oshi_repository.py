"""推しリポジトリ"""
from datetime import datetime
from typing import Optional

import structlog
from google.cloud import firestore

from app.models.oshi import OshiCreate, OshiModel

logger = structlog.get_logger(__name__)


class OshiRepository:
    """推しリポジトリ"""

    COLLECTION_NAME = "oshis"

    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection(self.COLLECTION_NAME)

    def get_all(self) -> list[OshiModel]:
        """全推しを取得（定期実行用）"""
        try:
            docs = self.collection.stream()
            oshis = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                oshis.append(OshiModel(**data))
            logger.info("get_all_oshis", count=len(oshis))
            return oshis
        except Exception as e:
            logger.error("get_all_oshis_failed", error=str(e))
            raise

    def get_all_by_user(self, user_id: str) -> list[OshiModel]:
        """ユーザーの全推しを取得"""
        try:
            docs = self.collection.where("user_id", "==", user_id).stream()
            oshis = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                oshis.append(OshiModel(**data))
            logger.info("get_all_by_user", user_id=user_id, count=len(oshis))
            return oshis
        except Exception as e:
            logger.error("get_all_by_user_failed", user_id=user_id, error=str(e))
            raise

    def get_by_id(self, oshi_id: str) -> Optional[OshiModel]:
        """IDで推しを取得"""
        try:
            doc = self.collection.document(oshi_id).get()
            if not doc.exists:
                return None
            data = doc.to_dict()
            data["id"] = doc.id
            return OshiModel(**data)
        except Exception as e:
            logger.error("get_by_id_failed", oshi_id=oshi_id, error=str(e))
            raise

    def create(self, user_id: str, oshi_data: OshiCreate) -> OshiModel:
        """推しを作成"""
        try:
            now = datetime.utcnow()
            doc_data = oshi_data.model_dump()
            doc_data.update(
                {
                    "user_id": user_id,
                    "created_at": now,
                    "updated_at": now,
                }
            )

            doc_ref = self.collection.document()
            doc_ref.set(doc_data)

            doc_data["id"] = doc_ref.id
            logger.info("oshi_created", oshi_id=doc_ref.id, user_id=user_id)
            return OshiModel(**doc_data)
        except Exception as e:
            logger.error("create_failed", user_id=user_id, error=str(e))
            raise

    def update(self, oshi_id: str, oshi_data: OshiCreate) -> Optional[OshiModel]:
        """推しを更新"""
        try:
            doc_ref = self.collection.document(oshi_id)
            doc = doc_ref.get()
            if not doc.exists:
                return None

            update_data = oshi_data.model_dump(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()

            doc_ref.update(update_data)

            updated_doc = doc_ref.get()
            data = updated_doc.to_dict()
            data["id"] = updated_doc.id
            logger.info("oshi_updated", oshi_id=oshi_id)
            return OshiModel(**data)
        except Exception as e:
            logger.error("update_failed", oshi_id=oshi_id, error=str(e))
            raise

    def delete(self, oshi_id: str) -> bool:
        """推しを削除"""
        try:
            doc_ref = self.collection.document(oshi_id)
            doc = doc_ref.get()
            if not doc.exists:
                return False

            doc_ref.delete()
            logger.info("oshi_deleted", oshi_id=oshi_id)
            return True
        except Exception as e:
            logger.error("delete_failed", oshi_id=oshi_id, error=str(e))
            raise
