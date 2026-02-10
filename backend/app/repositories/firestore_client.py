"""Firestoreクライアント（シングルトン）"""
from typing import Optional

from google.cloud import firestore

from app.config import settings

_firestore_client: Optional[firestore.Client] = None


def get_firestore_client() -> firestore.Client:
    """Firestoreクライアントを取得（シングルトン）"""
    global _firestore_client

    if _firestore_client is None:
        _firestore_client = firestore.Client(
            project=settings.google_cloud_project,
            database=settings.firestore_database,
        )

    return _firestore_client
