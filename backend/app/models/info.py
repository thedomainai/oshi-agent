"""収集情報モデル"""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Priority(str, Enum):
    """重要度"""

    URGENT = "urgent"  # 緊急（期限が近い、重要なイベント）
    IMPORTANT = "important"  # 重要（チェックすべき情報）
    NORMAL = "normal"  # 通常


class CollectedInfoBase(BaseModel):
    """収集情報の基本情報"""

    title: str = Field(..., min_length=1, max_length=500, description="タイトル")
    url: str = Field(..., description="情報源URL")
    snippet: Optional[str] = Field(None, max_length=1000, description="スニペット")
    priority: Priority = Field(default=Priority.NORMAL, description="重要度")


class CollectedInfoCreate(BaseModel):
    """収集情報作成リクエスト"""

    title: str = Field(..., min_length=1, max_length=500)
    url: str = Field(...)
    snippet: Optional[str] = Field(None, max_length=1000)
    oshi_id: str = Field(..., description="紐づく推しID")


class CollectedInfoModel(CollectedInfoBase):
    """収集情報モデル（DB保存形式）"""

    id: str = Field(..., description="情報ID")
    oshi_id: str = Field(..., description="紐づく推しID")
    collected_at: datetime = Field(..., description="収集日時")
    updated_at: datetime = Field(..., description="更新日時")

    class Config:
        from_attributes = True
