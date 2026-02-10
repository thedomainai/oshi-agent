"""ジョブモデル"""
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """ジョブステータス"""

    PENDING = "pending"  # 待機中
    RUNNING = "running"  # 実行中
    COMPLETED = "completed"  # 完了
    FAILED = "failed"  # 失敗


class JobType(str, Enum):
    """ジョブタイプ"""

    SCOUT = "scout"  # 情報収集
    PRIORITY = "priority"  # 重要度判定
    CALENDAR = "calendar"  # カレンダー登録
    TRIP = "trip"  # 遠征プラン生成
    BUDGET = "budget"  # 予算レポート生成


class JobModel(BaseModel):
    """ジョブモデル（DB保存形式）"""

    id: str = Field(..., description="ジョブID")
    user_id: Optional[str] = Field(None, description="ユーザーID")
    job_type: JobType = Field(..., description="ジョブタイプ")
    status: JobStatus = Field(default=JobStatus.PENDING, description="ステータス")
    input_data: dict[str, Any] = Field(default_factory=dict, description="入力データ")
    output_data: Optional[dict[str, Any]] = Field(None, description="出力データ")
    error_message: Optional[str] = Field(None, description="エラーメッセージ")
    created_at: datetime = Field(..., description="作成日時")
    started_at: Optional[datetime] = Field(None, description="開始日時")
    completed_at: Optional[datetime] = Field(None, description="完了日時")

    class Config:
        from_attributes = True
