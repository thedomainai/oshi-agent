"""イベントモデル"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class EventBase(BaseModel):
    """イベントの基本情報"""

    title: str = Field(..., min_length=1, max_length=200, description="イベント名")
    start_datetime: datetime = Field(..., description="開始日時")
    end_datetime: Optional[datetime] = Field(None, description="終了日時")
    location: Optional[str] = Field(None, max_length=200, description="会場")
    description: Optional[str] = Field(None, max_length=2000, description="詳細")


class EventCreate(EventBase):
    """イベント作成リクエスト"""

    oshi_id: str = Field(..., description="紐づく推しID")
    info_id: Optional[str] = Field(None, description="情報源ID")


class EventModel(EventBase):
    """イベントモデル（DB保存形式）"""

    id: str = Field(..., description="イベントID")
    oshi_id: str = Field(..., description="紐づく推しID")
    info_id: Optional[str] = Field(None, description="情報源ID")
    calendar_event_id: Optional[str] = Field(None, description="Google CalendarのイベントID")
    created_at: datetime = Field(..., description="作成日時")
    updated_at: datetime = Field(..., description="更新日時")

    class Config:
        from_attributes = True
