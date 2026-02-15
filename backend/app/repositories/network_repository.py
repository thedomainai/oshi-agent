"""ネットワークノードリポジトリ"""
from datetime import datetime
from typing import Optional

import structlog
from google.cloud import firestore

from app.models.network_node import NetworkNodeCreate, NetworkNodeModel

logger = structlog.get_logger(__name__)


class NetworkRepository:
    """ネットワークノードリポジトリ"""

    COLLECTION_NAME = "network_nodes"

    def __init__(self, db: firestore.Client):
        self.db = db
        self.collection = db.collection(self.COLLECTION_NAME)

    def get_all_by_oshi(self, oshi_id: str) -> list[NetworkNodeModel]:
        """推しIDでネットワークノードを全取得"""
        try:
            docs = (
                self.collection.where("oshi_id", "==", oshi_id)
                .order_by("ring")
                .order_by("discovered_at")
                .stream()
            )
            nodes = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                nodes.append(NetworkNodeModel(**data))
            logger.info("get_all_by_oshi", oshi_id=oshi_id, count=len(nodes))
            return nodes
        except Exception as e:
            logger.error("get_all_by_oshi_failed", oshi_id=oshi_id, error=str(e))
            raise

    def get_active_by_oshi(self, oshi_id: str) -> list[NetworkNodeModel]:
        """推しIDでアクティブなネットワークノードを取得"""
        try:
            docs = (
                self.collection.where("oshi_id", "==", oshi_id)
                .where("is_active", "==", True)
                .stream()
            )
            nodes = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                nodes.append(NetworkNodeModel(**data))
            logger.info("get_active_by_oshi", oshi_id=oshi_id, count=len(nodes))
            return nodes
        except Exception as e:
            logger.error("get_active_by_oshi_failed", oshi_id=oshi_id, error=str(e))
            raise

    def get_by_id(self, node_id: str) -> Optional[NetworkNodeModel]:
        """IDでノードを取得"""
        try:
            doc = self.collection.document(node_id).get()
            if not doc.exists:
                return None
            data = doc.to_dict()
            data["id"] = doc.id
            return NetworkNodeModel(**data)
        except Exception as e:
            logger.error("get_by_id_failed", node_id=node_id, error=str(e))
            raise

    def find_by_name(self, oshi_id: str, name: str) -> Optional[NetworkNodeModel]:
        """名前で重複チェック"""
        try:
            docs = (
                self.collection.where("oshi_id", "==", oshi_id)
                .where("name", "==", name)
                .limit(1)
                .stream()
            )
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                return NetworkNodeModel(**data)
            return None
        except Exception as e:
            logger.error(
                "find_by_name_failed", oshi_id=oshi_id, name=name, error=str(e)
            )
            raise

    def create(self, node_data: NetworkNodeCreate) -> NetworkNodeModel:
        """ネットワークノードを作成"""
        try:
            now = datetime.utcnow()
            doc_data = node_data.model_dump()
            # Enumを値に変換
            doc_data["node_type"] = doc_data["node_type"].value if hasattr(doc_data["node_type"], "value") else doc_data["node_type"]
            doc_data["ring"] = doc_data["ring"].value if hasattr(doc_data["ring"], "value") else doc_data["ring"]
            doc_data.update(
                {
                    "discovered_at": now,
                    "last_searched_at": None,
                }
            )

            doc_ref = self.collection.document()
            doc_ref.set(doc_data)

            doc_data["id"] = doc_ref.id
            logger.info(
                "network_node_created",
                node_id=doc_ref.id,
                oshi_id=node_data.oshi_id,
                name=node_data.name,
            )
            return NetworkNodeModel(**doc_data)
        except Exception as e:
            logger.error("create_failed", error=str(e))
            raise

    def create_batch(
        self, nodes_data: list[NetworkNodeCreate]
    ) -> list[NetworkNodeModel]:
        """ネットワークノードをバッチ作成"""
        try:
            batch = self.db.batch()
            created_nodes = []
            now = datetime.utcnow()

            for node_data in nodes_data:
                doc_data = node_data.model_dump()
                doc_data["node_type"] = doc_data["node_type"].value if hasattr(doc_data["node_type"], "value") else doc_data["node_type"]
                doc_data["ring"] = doc_data["ring"].value if hasattr(doc_data["ring"], "value") else doc_data["ring"]
                doc_data.update(
                    {
                        "discovered_at": now,
                        "last_searched_at": None,
                    }
                )

                doc_ref = self.collection.document()
                batch.set(doc_ref, doc_data)

                doc_data["id"] = doc_ref.id
                created_nodes.append(NetworkNodeModel(**doc_data))

            batch.commit()
            logger.info("network_node_batch_created", count=len(created_nodes))
            return created_nodes
        except Exception as e:
            logger.error("create_batch_failed", error=str(e))
            raise

    def update_last_searched(self, node_id: str) -> bool:
        """最終検索日時を更新"""
        try:
            doc_ref = self.collection.document(node_id)
            doc = doc_ref.get()
            if not doc.exists:
                return False

            doc_ref.update({"last_searched_at": datetime.utcnow()})
            return True
        except Exception as e:
            logger.error(
                "update_last_searched_failed", node_id=node_id, error=str(e)
            )
            raise

    def deactivate(self, node_id: str) -> bool:
        """ノードを無効化"""
        try:
            doc_ref = self.collection.document(node_id)
            doc = doc_ref.get()
            if not doc.exists:
                return False

            doc_ref.update({"is_active": False})
            logger.info("network_node_deactivated", node_id=node_id)
            return True
        except Exception as e:
            logger.error("deactivate_failed", node_id=node_id, error=str(e))
            raise
