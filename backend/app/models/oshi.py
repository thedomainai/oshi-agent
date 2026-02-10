"""推しモデル"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class OshiBase(BaseModel):
    """推しの基本情報"""

    name: str = Field(..., min_length=1, max_length=100, description="推しの名前")
    category: str = Field(
        ..., min_length=1, max_length=50, description="カテゴリ (例: アイドル、アニメ、声優)"
    )
    official_url: Optional[str] = Field(None, description="公式URL")
    notes: Optional[str] = Field(None, max_length=1000, description="メモ")


class OshiCreate(OshiBase):
    """推し作成リクエスト"""

    pass


class OshiModel(OshiBase):
    """推しモデル（DB保存形式）"""

    id: str = Field(..., description="推しID")
    user_id: str = Field(..., description="所有ユーザーID")
    created_at: datetime = Field(..., description="作成日時")
    updated_at: datetime = Field(..., description="更新日時")

    class Config:
        from_attributes = True
