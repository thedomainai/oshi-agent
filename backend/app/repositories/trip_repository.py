"""遠征プランリポジトリ"""
from datetime import datetime
from typing import Optional

import structlog
from google.cloud import firestore

from app.models.trip_plan import TripPlanCreate, TripPlanModel

logger = structlog.get_logger(__name__)


class TripRepository:
    """遠征プランリポジトリ"""

    COLLECTION_NAME = "trip_plans"

    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection(self.COLLECTION_NAME)

    def get_by_event(self, event_id: str) -> Optional[TripPlanModel]:
        """イベントIDで遠征プランを取得"""
        try:
            docs = (
                self.collection.where("event_id", "==", event_id).limit(1).stream()
            )
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                return TripPlanModel(**data)
            return None
        except Exception as e:
            logger.error("get_by_event_failed", event_id=event_id, error=str(e))
            raise

    def create(self, user_id: str, plan_data: TripPlanCreate) -> TripPlanModel:
        """遠征プランを作成"""
        try:
            now = datetime.utcnow()
            doc_data = plan_data.model_dump()
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
            logger.info(
                "trip_plan_created",
                plan_id=doc_ref.id,
                event_id=plan_data.event_id,
            )
            return TripPlanModel(**doc_data)
        except Exception as e:
            logger.error("create_failed", error=str(e))
            raise
