"""支出モデル"""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ExpenseCategory(str, Enum):
    """支出カテゴリ"""

    TICKET = "ticket"  # チケット
    GOODS = "goods"  # グッズ
    TRANSPORT = "transport"  # 交通費
    ACCOMMODATION = "accommodation"  # 宿泊費
    FOOD = "food"  # 飲食費
    OTHER = "other"  # その他


class ExpenseBase(BaseModel):
    """支出の基本情報"""

    amount: int = Field(..., gt=0, description="金額（円）")
    category: ExpenseCategory = Field(..., description="カテゴリ")
    description: Optional[str] = Field(None, max_length=500, description="説明")
    expense_date: datetime = Field(..., description="支出日")


class ExpenseCreate(ExpenseBase):
    """支出作成リクエスト"""

    oshi_id: Optional[str] = Field(None, description="紐づく推しID")
    event_id: Optional[str] = Field(None, description="紐づくイベントID")


class ExpenseModel(ExpenseBase):
    """支出モデル（DB保存形式）"""

    id: str = Field(..., description="支出ID")
    user_id: str = Field(..., description="ユーザーID")
    oshi_id: Optional[str] = Field(None, description="紐づく推しID")
    event_id: Optional[str] = Field(None, description="紐づくイベントID")
    created_at: datetime = Field(..., description="作成日時")

    class Config:
        from_attributes = True
