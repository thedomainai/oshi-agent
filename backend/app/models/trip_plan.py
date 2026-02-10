"""遠征プランモデル"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TransportInfo(BaseModel):
    """交通情報"""

    mode: str = Field(..., description="交通手段 (例: train, car, flight)")
    duration_minutes: Optional[int] = Field(None, description="所要時間（分）")
    distance_km: Optional[float] = Field(None, description="距離（km）")
    estimated_cost: Optional[int] = Field(None, description="概算費用（円）")
    route_description: Optional[str] = Field(None, max_length=1000, description="ルート説明")


class AccommodationInfo(BaseModel):
    """宿泊情報"""

    nights: int = Field(default=0, ge=0, description="宿泊数")
    estimated_cost: Optional[int] = Field(None, description="概算費用（円）")
    notes: Optional[str] = Field(None, max_length=500, description="備考")


class TripPlanBase(BaseModel):
    """遠征プランの基本情報"""

    departure: str = Field(..., min_length=1, max_length=200, description="出発地")
    destination: str = Field(..., min_length=1, max_length=200, description="目的地")
    transport: TransportInfo = Field(..., description="交通情報")
    accommodation: AccommodationInfo = Field(..., description="宿泊情報")
    total_estimated_cost: int = Field(default=0, ge=0, description="合計概算費用（円）")
    advice: Optional[str] = Field(None, max_length=2000, description="AIアドバイス")


class TripPlanCreate(TripPlanBase):
    """遠征プラン作成リクエスト"""

    event_id: str = Field(..., description="紐づくイベントID")


class TripPlanModel(TripPlanBase):
    """遠征プランモデル（DB保存形式）"""

    id: str = Field(..., description="プランID")
    user_id: str = Field(..., description="ユーザーID")
    event_id: str = Field(..., description="紐づくイベントID")
    created_at: datetime = Field(..., description="作成日時")
    updated_at: datetime = Field(..., description="更新日時")

    class Config:
        from_attributes = True
