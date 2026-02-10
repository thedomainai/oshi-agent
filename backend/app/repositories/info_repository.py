"""収集情報リポジトリ"""
from datetime import datetime
from typing import Optional

import structlog
from google.cloud import firestore

from app.models.info import CollectedInfoCreate, CollectedInfoModel, Priority

logger = structlog.get_logger(__name__)


class InfoRepository:
    """収集情報リポジトリ"""

    COLLECTION_NAME = "collected_infos"

    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection(self.COLLECTION_NAME)

    def get_all_by_oshi(self, oshi_id: str) -> list[CollectedInfoModel]:
        """推しIDで収集情報を取得"""
        try:
            docs = (
                self.collection.where("oshi_id", "==", oshi_id)
                .order_by("collected_at", direction=firestore.Query.DESCENDING)
                .stream()
            )
            infos = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                infos.append(CollectedInfoModel(**data))
            logger.info("get_all_by_oshi", oshi_id=oshi_id, count=len(infos))
            return infos
        except Exception as e:
            logger.error("get_all_by_oshi_failed", oshi_id=oshi_id, error=str(e))
            raise

    def get_by_id(self, info_id: str) -> Optional[CollectedInfoModel]:
        """IDで収集情報を取得"""
        try:
            doc = self.collection.document(info_id).get()
            if not doc.exists:
                return None
            data = doc.to_dict()
            data["id"] = doc.id
            return CollectedInfoModel(**data)
        except Exception as e:
            logger.error("get_by_id_failed", info_id=info_id, error=str(e))
            raise

    def find_by_url(self, oshi_id: str, url: str) -> Optional[CollectedInfoModel]:
        """URLで重複チェック"""
        try:
            docs = (
                self.collection.where("oshi_id", "==", oshi_id)
                .where("url", "==", url)
                .limit(1)
                .stream()
            )
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                return CollectedInfoModel(**data)
            return None
        except Exception as e:
            logger.error(
                "find_by_url_failed", oshi_id=oshi_id, url=url, error=str(e)
            )
            raise

    def create(self, info_data: CollectedInfoCreate) -> CollectedInfoModel:
        """収集情報を作成"""
        try:
            now = datetime.utcnow()
            doc_data = info_data.model_dump()
            doc_data.update(
                {
                    "priority": Priority.NORMAL.value,
                    "collected_at": now,
                    "updated_at": now,
                }
            )

            doc_ref = self.collection.document()
            doc_ref.set(doc_data)

            doc_data["id"] = doc_ref.id
            logger.info(
                "info_created", info_id=doc_ref.id, oshi_id=info_data.oshi_id
            )
            return CollectedInfoModel(**doc_data)
        except Exception as e:
            logger.error("create_failed", error=str(e))
            raise

    def create_batch(
        self, infos_data: list[CollectedInfoCreate]
    ) -> list[CollectedInfoModel]:
        """収集情報をバッチ作成"""
        try:
            batch = self.db.batch()
            created_infos = []
            now = datetime.utcnow()

            for info_data in infos_data:
                doc_data = info_data.model_dump()
                doc_data.update(
                    {
                        "priority": Priority.NORMAL.value,
                        "collected_at": now,
                        "updated_at": now,
                    }
                )

                doc_ref = self.collection.document()
                batch.set(doc_ref, doc_data)

                doc_data["id"] = doc_ref.id
                created_infos.append(CollectedInfoModel(**doc_data))

            batch.commit()
            logger.info("info_batch_created", count=len(created_infos))
            return created_infos
        except Exception as e:
            logger.error("create_batch_failed", error=str(e))
            raise

    def update_priority(self, info_id: str, priority: Priority) -> bool:
        """重要度を更新"""
        try:
            doc_ref = self.collection.document(info_id)
            doc = doc_ref.get()
            if not doc.exists:
                return False

            doc_ref.update(
                {
                    "priority": priority.value,
                    "updated_at": datetime.utcnow(),
                }
            )
            logger.info("priority_updated", info_id=info_id, priority=priority.value)
            return True
        except Exception as e:
            logger.error("update_priority_failed", info_id=info_id, error=str(e))
            raise
