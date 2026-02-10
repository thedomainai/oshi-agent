"""エージェントルーター"""
from typing import Any, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field

from app.agents.budget_agent import BudgetAgent
from app.agents.calendar_agent import CalendarAgent
from app.agents.root_agent import RootAgent
from app.agents.trip_agent import TripAgent
from app.dependencies import (
    get_budget_agent,
    get_calendar_agent,
    get_oshi_repository,
    get_root_agent,
    get_trip_agent,
    get_user_id,
    verify_internal_api_key,
)
from app.repositories.oshi_repository import OshiRepository

logger = structlog.get_logger(__name__)

router = APIRouter(
    prefix="/agent",
    tags=["agent"],
    dependencies=[Depends(verify_internal_api_key)],
)


# リクエスト/レスポンスモデル
class ScoutRequest(BaseModel):
    """Scout Agent実行リクエスト"""

    oshi_id: str = Field(..., description="推しID")


class ScoutResponse(BaseModel):
    """Scout Agent実行レスポンス"""

    oshi_id: str
    oshi_name: str
    collected_count: int
    new_info_ids: list[str]
    priority_results: dict[str, str]


class PriorityRequest(BaseModel):
    """Priority Agent実行リクエスト"""

    info_ids: list[str] = Field(..., description="情報IDのリスト")


class PriorityResponse(BaseModel):
    """Priority Agent実行レスポンス"""

    results: dict[str, str] = Field(..., description="{info_id: priority}")


class CalendarRequest(BaseModel):
    """Calendar Agent実行リクエスト"""

    event_id: str = Field(..., description="イベントID")
    oauth_token: str = Field(..., description="OAuth2アクセストークン")


class CalendarResponse(BaseModel):
    """Calendar Agent実行レスポンス"""

    event_id: str
    calendar_event_id: str


class TripRequest(BaseModel):
    """Trip Agent実行リクエスト"""

    event_id: str = Field(..., description="イベントID")
    departure: str = Field(..., description="出発地")


class TripResponse(BaseModel):
    """Trip Agent実行レスポンス"""

    plan_id: str


class BudgetRequest(BaseModel):
    """Budget Agent実行リクエスト"""

    year: int = Field(..., ge=2000, le=2100, description="年")
    month: int = Field(..., ge=1, le=12, description="月")


class BudgetResponse(BaseModel):
    """Budget Agent実行レスポンス"""

    year: int
    month: int
    total: int
    by_category: dict[str, int]
    expenses_count: int
    advice: str


@router.post("/scout", response_model=ScoutResponse)
async def run_scout(
    request: ScoutRequest,
    user_id: str = Depends(get_user_id),
    root_agent: RootAgent = Depends(get_root_agent),
    oshi_repo: OshiRepository = Depends(get_oshi_repository),
):
    """Scout Agentを実行（情報収集 + 重要度判定）"""
    try:
        # ユーザーが推しの所有者であることを検証
        oshi = oshi_repo.get_by_id(request.oshi_id)
        if not oshi or oshi.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="この推しへのアクセス権限がありません")

        logger.info(
            "api_scout_start",
            user_id=user_id,
            oshi_id=request.oshi_id,
        )

        result = await root_agent.run_scout_workflow(request.oshi_id)

        logger.info(
            "api_scout_success",
            user_id=user_id,
            oshi_id=request.oshi_id,
            collected_count=result["collected_count"],
        )

        return ScoutResponse(**result)

    except ValueError as e:
        logger.warning("api_scout_not_found", error=str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("api_scout_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/scout-all")
async def run_scout_all(
    root_agent: RootAgent = Depends(get_root_agent),
):
    """全推しのScout Agentを実行（Cloud Scheduler用）"""
    try:
        logger.info("api_scout_all_start")

        result = await root_agent.run_all_scouts()

        logger.info("api_scout_all_success")
        return result

    except Exception as e:
        logger.error("api_scout_all_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/calendar", response_model=CalendarResponse)
async def run_calendar(
    request: CalendarRequest,
    user_id: str = Depends(get_user_id),
    calendar_agent: CalendarAgent = Depends(get_calendar_agent),
):
    """Calendar Agentを実行（カレンダー登録）"""
    try:
        logger.info(
            "api_calendar_start",
            user_id=user_id,
            event_id=request.event_id,
        )

        calendar_event_id = await calendar_agent.register_event(
            event_id=request.event_id,
            oauth_token=request.oauth_token,
        )

        logger.info(
            "api_calendar_success",
            user_id=user_id,
            event_id=request.event_id,
            calendar_event_id=calendar_event_id,
        )

        return CalendarResponse(
            event_id=request.event_id,
            calendar_event_id=calendar_event_id,
        )

    except ValueError as e:
        logger.warning("api_calendar_not_found", error=str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("api_calendar_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/trip", response_model=TripResponse)
async def run_trip(
    request: TripRequest,
    user_id: str = Depends(get_user_id),
    trip_agent: TripAgent = Depends(get_trip_agent),
):
    """Trip Agentを実行（遠征プラン生成）"""
    try:
        logger.info(
            "api_trip_start",
            user_id=user_id,
            event_id=request.event_id,
            departure=request.departure,
        )

        plan_id = await trip_agent.generate_plan(
            event_id=request.event_id,
            user_id=user_id,
            departure=request.departure,
        )

        logger.info(
            "api_trip_success",
            user_id=user_id,
            event_id=request.event_id,
            plan_id=plan_id,
        )

        return TripResponse(plan_id=plan_id)

    except ValueError as e:
        logger.warning("api_trip_not_found", error=str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("api_trip_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/budget", response_model=BudgetResponse)
async def run_budget(
    request: BudgetRequest,
    user_id: str = Depends(get_user_id),
    budget_agent: BudgetAgent = Depends(get_budget_agent),
):
    """Budget Agentを実行（予算レポート生成）"""
    try:
        logger.info(
            "api_budget_start",
            user_id=user_id,
            year=request.year,
            month=request.month,
        )

        report = await budget_agent.generate_report(
            user_id=user_id,
            year=request.year,
            month=request.month,
        )

        logger.info(
            "api_budget_success",
            user_id=user_id,
            year=request.year,
            month=request.month,
            total=report["total"],
        )

        return BudgetResponse(**report)

    except Exception as e:
        logger.error("api_budget_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
