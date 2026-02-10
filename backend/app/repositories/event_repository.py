"""イベントリポジトリ"""
from datetime import datetime
from typing import Optional

import structlog
from google.cloud import firestore

from app.models.event import EventCreate, EventModel

logger = structlog.get_logger(__name__)


class EventRepository:
    """イベントリポジトリ"""

    COLLECTION_NAME = "events"

    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection(self.COLLECTION_NAME)

    def get_all_by_oshi(self, oshi_id: str) -> list[EventModel]:
        """推しIDでイベントを取得"""
        try:
            docs = (
                self.collection.where("oshi_id", "==", oshi_id)
                .order_by("start_datetime", direction=firestore.Query.ASCENDING)
                .stream()
            )
            events = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                events.append(EventModel(**data))
            logger.info("get_all_by_oshi", oshi_id=oshi_id, count=len(events))
            return events
        except Exception as e:
            logger.error("get_all_by_oshi_failed", oshi_id=oshi_id, error=str(e))
            raise

    def get_by_id(self, event_id: str) -> Optional[EventModel]:
        """IDでイベントを取得"""
        try:
            doc = self.collection.document(event_id).get()
            if not doc.exists:
                return None
            data = doc.to_dict()
            data["id"] = doc.id
            return EventModel(**data)
        except Exception as e:
            logger.error("get_by_id_failed", event_id=event_id, error=str(e))
            raise

    def create(self, event_data: EventCreate) -> EventModel:
        """イベントを作成"""
        try:
            now = datetime.utcnow()
            doc_data = event_data.model_dump()
            doc_data.update(
                {
                    "created_at": now,
                    "updated_at": now,
                }
            )

            doc_ref = self.collection.document()
            doc_ref.set(doc_data)

            doc_data["id"] = doc_ref.id
            logger.info(
                "event_created", event_id=doc_ref.id, oshi_id=event_data.oshi_id
            )
            return EventModel(**doc_data)
        except Exception as e:
            logger.error("create_failed", error=str(e))
            raise

    def update_calendar_id(
        self, event_id: str, calendar_event_id: str
    ) -> Optional[EventModel]:
        """カレンダーイベントIDを更新"""
        try:
            doc_ref = self.collection.document(event_id)
            doc = doc_ref.get()
            if not doc.exists:
                return None

            doc_ref.update(
                {
                    "calendar_event_id": calendar_event_id,
                    "updated_at": datetime.utcnow(),
                }
            )

            updated_doc = doc_ref.get()
            data = updated_doc.to_dict()
            data["id"] = updated_doc.id
            logger.info(
                "calendar_id_updated",
                event_id=event_id,
                calendar_event_id=calendar_event_id,
            )
            return EventModel(**data)
        except Exception as e:
            logger.error("update_calendar_id_failed", event_id=event_id, error=str(e))
            raise
