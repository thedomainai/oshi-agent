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
    get_network_repository,
    get_oshi_repository,
    get_root_agent,
    get_trip_agent,
    get_user_id,
    verify_internal_api_key,
)
from app.repositories.network_repository import NetworkRepository
from app.repositories.oshi_repository import OshiRepository

# ADK は Python 3.10+ が必要。利用可能な場合のみインポート
try:
    from app.agents.adk_runner import run_scout_workflow_adk
    ADK_AVAILABLE = True
except ImportError:
    ADK_AVAILABLE = False

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


class SummaryRequest(BaseModel):
    """Summary生成リクエスト"""

    oshi_id: str = Field(..., description="推しID")


class SummaryResponse(BaseModel):
    """Summary生成レスポンス"""

    oshi_id: str
    oshi_name: str
    collected_count: int
    summary: str


class NetworkDiscoverRequest(BaseModel):
    """ネットワーク発見リクエスト"""

    oshi_id: str = Field(..., description="推しID")


class NetworkDiscoverResponse(BaseModel):
    """ネットワーク発見レスポンス"""

    oshi_id: str
    oshi_name: str
    discovered_count: int
    nodes: list[dict[str, Any]]


class NetworkNodeResponse(BaseModel):
    """ネットワークノードレスポンス"""

    id: str
    name: str
    node_type: str
    ring: int
    relationship: str
    is_active: bool


class NetworkListResponse(BaseModel):
    """ネットワーク一覧レスポンス"""

    oshi_id: str
    nodes: list[NetworkNodeResponse]


class NetworkScoutResponse(BaseModel):
    """ネットワークスカウトレスポンス"""

    oshi_id: str
    oshi_name: str
    direct_count: int
    network_count: int
    total_count: int
    new_info_ids: list[str]
    priority_results: dict[str, str]


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


class AdkScoutResponse(BaseModel):
    """ADK Scout Agent実行レスポンス"""

    oshi_id: str
    oshi_name: str
    response: str
    session_id: str


@router.post("/scout-adk", response_model=AdkScoutResponse)
async def run_scout_adk(
    request: ScoutRequest,
    user_id: str = Depends(get_user_id),
    oshi_repo: OshiRepository = Depends(get_oshi_repository),
):
    """ADK版 Scout Agentを実行（LlmAgent + SequentialAgent による自律的なワークフロー）"""
    if not ADK_AVAILABLE:
        raise HTTPException(
            status_code=501,
            detail="ADK is not available in this environment",
        )

    try:
        oshi = oshi_repo.get_by_id(request.oshi_id)
        if not oshi or oshi.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="この推しへのアクセス権限がありません")

        logger.info(
            "api_scout_adk_start",
            user_id=user_id,
            oshi_id=request.oshi_id,
        )

        result = await run_scout_workflow_adk(
            oshi_id=request.oshi_id,
            oshi_name=oshi.get("name", ""),
            user_id=user_id,
        )

        logger.info(
            "api_scout_adk_success",
            user_id=user_id,
            oshi_id=request.oshi_id,
        )

        return AdkScoutResponse(**result)

    except ValueError as e:
        logger.warning("api_scout_adk_not_found", error=str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("api_scout_adk_failed", error=str(e))
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


@router.post("/summary", response_model=SummaryResponse)
async def run_summary(
    request: SummaryRequest,
    user_id: str = Depends(get_user_id),
    root_agent: RootAgent = Depends(get_root_agent),
    oshi_repo: OshiRepository = Depends(get_oshi_repository),
):
    """Scout + Priority + サマリー生成を実行（推し登録直後の初回体験用）"""
    try:
        # ユーザーが推しの所有者であることを検証
        oshi = oshi_repo.get_by_id(request.oshi_id)
        if not oshi or oshi.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="この推しへのアクセス権限がありません")

        logger.info(
            "api_summary_start",
            user_id=user_id,
            oshi_id=request.oshi_id,
        )

        result = await root_agent.run_scout_and_summarize(request.oshi_id)

        logger.info(
            "api_summary_success",
            user_id=user_id,
            oshi_id=request.oshi_id,
            collected_count=result["collected_count"],
        )

        return SummaryResponse(
            oshi_id=result["oshi_id"],
            oshi_name=result["oshi_name"],
            collected_count=result["collected_count"],
            summary=result["summary"],
        )

    except ValueError as e:
        logger.warning("api_summary_not_found", error=str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("api_summary_failed", error=str(e))
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


@router.post("/network/discover", response_model=NetworkDiscoverResponse)
async def discover_network(
    request: NetworkDiscoverRequest,
    user_id: str = Depends(get_user_id),
    root_agent: RootAgent = Depends(get_root_agent),
    oshi_repo: OshiRepository = Depends(get_oshi_repository),
):
    """ネットワーク自動発見（推しの関連人物・組織・情報源をAIで特定）"""
    try:
        oshi = oshi_repo.get_by_id(request.oshi_id)
        if not oshi or oshi.user_id != user_id:
            raise HTTPException(status_code=403, detail="この推しへのアクセス権限がありません")

        logger.info(
            "api_network_discover_start",
            user_id=user_id,
            oshi_id=request.oshi_id,
        )

        result = await root_agent.discover_network(request.oshi_id)

        logger.info(
            "api_network_discover_success",
            user_id=user_id,
            oshi_id=request.oshi_id,
            discovered_count=result["discovered_count"],
        )

        return NetworkDiscoverResponse(**result)

    except ValueError as e:
        logger.warning("api_network_discover_not_found", error=str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("api_network_discover_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/network/{oshi_id}", response_model=NetworkListResponse)
async def get_network(
    oshi_id: str,
    user_id: str = Depends(get_user_id),
    oshi_repo: OshiRepository = Depends(get_oshi_repository),
    network_repo: NetworkRepository = Depends(get_network_repository),
):
    """推しのネットワーク一覧を取得"""
    try:
        oshi = oshi_repo.get_by_id(oshi_id)
        if not oshi or oshi.user_id != user_id:
            raise HTTPException(status_code=403, detail="この推しへのアクセス権限がありません")

        nodes = network_repo.get_all_by_oshi(oshi_id)

        return NetworkListResponse(
            oshi_id=oshi_id,
            nodes=[
                NetworkNodeResponse(
                    id=n.id,
                    name=n.name,
                    node_type=n.node_type.value if hasattr(n.node_type, "value") else n.node_type,
                    ring=n.ring.value if hasattr(n.ring, "value") else n.ring,
                    relationship=n.relationship,
                    is_active=n.is_active,
                )
                for n in nodes
            ],
        )

    except Exception as e:
        logger.error("api_network_get_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/network/scout", response_model=NetworkScoutResponse)
async def run_network_scout(
    request: ScoutRequest,
    user_id: str = Depends(get_user_id),
    root_agent: RootAgent = Depends(get_root_agent),
    oshi_repo: OshiRepository = Depends(get_oshi_repository),
):
    """ネットワーク全体をスカウト（通常スカウト + ネットワークノード経由）"""
    try:
        oshi = oshi_repo.get_by_id(request.oshi_id)
        if not oshi or oshi.user_id != user_id:
            raise HTTPException(status_code=403, detail="この推しへのアクセス権限がありません")

        logger.info(
            "api_network_scout_start",
            user_id=user_id,
            oshi_id=request.oshi_id,
        )

        result = await root_agent.run_network_scout(request.oshi_id)

        logger.info(
            "api_network_scout_success",
            user_id=user_id,
            oshi_id=request.oshi_id,
            total_count=result["total_count"],
        )

        return NetworkScoutResponse(**result)

    except ValueError as e:
        logger.warning("api_network_scout_not_found", error=str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("api_network_scout_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
