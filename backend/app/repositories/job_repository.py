"""ジョブリポジトリ"""
from datetime import datetime
from typing import Any, Optional

import structlog
from google.cloud import firestore

from app.models.job import JobModel, JobStatus, JobType

logger = structlog.get_logger(__name__)


class JobRepository:
    """ジョブリポジトリ"""

    COLLECTION_NAME = "jobs"

    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection(self.COLLECTION_NAME)

    def create(
        self,
        job_type: JobType,
        input_data: dict[str, Any],
        user_id: Optional[str] = None,
    ) -> JobModel:
        """ジョブを作成"""
        try:
            now = datetime.utcnow()
            doc_data = {
                "job_type": job_type.value,
                "status": JobStatus.PENDING.value,
                "input_data": input_data,
                "user_id": user_id,
                "created_at": now,
            }

            doc_ref = self.collection.document()
            doc_ref.set(doc_data)

            doc_data["id"] = doc_ref.id
            logger.info(
                "job_created",
                job_id=doc_ref.id,
                job_type=job_type.value,
                user_id=user_id,
            )
            return JobModel(**doc_data)
        except Exception as e:
            logger.error("create_failed", error=str(e))
            raise

    def update_status(
        self,
        job_id: str,
        status: JobStatus,
        output_data: Optional[dict[str, Any]] = None,
        error_message: Optional[str] = None,
    ) -> Optional[JobModel]:
        """ジョブステータスを更新"""
        try:
            doc_ref = self.collection.document(job_id)
            doc = doc_ref.get()
            if not doc.exists:
                return None

            now = datetime.utcnow()
            update_data: dict[str, Any] = {"status": status.value}

            if status == JobStatus.RUNNING:
                update_data["started_at"] = now
            elif status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                update_data["completed_at"] = now

            if output_data is not None:
                update_data["output_data"] = output_data

            if error_message is not None:
                update_data["error_message"] = error_message

            doc_ref.update(update_data)

            updated_doc = doc_ref.get()
            data = updated_doc.to_dict()
            data["id"] = updated_doc.id
            logger.info("job_status_updated", job_id=job_id, status=status.value)
            return JobModel(**data)
        except Exception as e:
            logger.error("update_status_failed", job_id=job_id, error=str(e))
            raise

    def get_latest(
        self, job_type: JobType, user_id: Optional[str] = None
    ) -> Optional[JobModel]:
        """最新のジョブを取得"""
        try:
            query = self.collection.where("job_type", "==", job_type.value)
            if user_id:
                query = query.where("user_id", "==", user_id)

            docs = (
                query.order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(1)
                .stream()
            )

            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                return JobModel(**data)
            return None
        except Exception as e:
            logger.error(
                "get_latest_failed", job_type=job_type.value, user_id=user_id, error=str(e)
            )
            raise
