"""ネットワークノードモデル"""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class NodeType(str, Enum):
    """ノードの種類"""

    MEMBER = "member"
    STAFF = "staff"
    ORGANIZATION = "org"
    FAN_ACCOUNT = "fan"
    VENUE = "venue"
    COLLABORATOR = "collab"
    MEDIA = "media"


class NodeRing(int, Enum):
    """ノードのリング（推しからの距離）"""

    INNER = 1  # 直接関係者（メンバー、事務所、スタッフ等）
    OUTER = 2  # 周辺（ファンアカウント、会場、メディア等）


class NetworkNodeBase(BaseModel):
    """ネットワークノードの基本情報"""

    name: str = Field(..., min_length=1, max_length=200, description="ノード名")
    node_type: NodeType = Field(..., description="ノードの種類")
    ring: NodeRing = Field(..., description="リング（推しからの距離）")
    relationship: str = Field(..., max_length=200, description="推しとの関係性")
    search_queries: list[str] = Field(
        default_factory=list, description="このノードの情報収集用検索クエリ"
    )
    is_active: bool = Field(default=True, description="監視対象かどうか")


class NetworkNodeCreate(NetworkNodeBase):
    """ネットワークノード作成リクエスト"""

    oshi_id: str = Field(..., description="推しID")


class NetworkNodeModel(NetworkNodeBase):
    """ネットワークノードモデル（DB保存形式）"""

    id: str = Field(..., description="ノードID")
    oshi_id: str = Field(..., description="推しID")
    discovered_at: datetime = Field(..., description="発見日時")
    last_searched_at: Optional[datetime] = Field(None, description="最終検索日時")

    class Config:
        from_attributes = True
