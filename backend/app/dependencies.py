"""依存性注入"""
from typing import Optional

from fastapi import Header, HTTPException

from app.agents.budget_agent import BudgetAgent
from app.agents.calendar_agent import CalendarAgent
from app.agents.priority_agent import PriorityAgent
from app.agents.root_agent import RootAgent
from app.agents.scout_agent import ScoutAgent
from app.agents.trip_agent import TripAgent
from app.config import settings
from app.external.gemini_client import GeminiClient
from app.external.google_maps import GoogleMapsClient
from app.external.google_search import GoogleSearchClient
from app.repositories.event_repository import EventRepository
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.firestore_client import get_firestore_client
from app.repositories.info_repository import InfoRepository
from app.repositories.job_repository import JobRepository
from app.repositories.network_repository import NetworkRepository
from app.repositories.oshi_repository import OshiRepository
from app.repositories.trip_repository import TripRepository


# Firestoreクライアント
def get_db():
    """Firestoreクライアントを取得"""
    return get_firestore_client()


# リポジトリ
def get_oshi_repository():
    """OshiRepositoryを取得"""
    return OshiRepository(get_db())


def get_info_repository():
    """InfoRepositoryを取得"""
    return InfoRepository(get_db())


def get_event_repository():
    """EventRepositoryを取得"""
    return EventRepository(get_db())


def get_trip_repository():
    """TripRepositoryを取得"""
    return TripRepository(get_db())


def get_expense_repository():
    """ExpenseRepositoryを取得"""
    return ExpenseRepository(get_db())


def get_job_repository():
    """JobRepositoryを取得"""
    return JobRepository(get_db())


def get_network_repository():
    """NetworkRepositoryを取得"""
    return NetworkRepository(get_db())


# 外部APIクライアント
def get_google_search_client():
    """GoogleSearchClientを取得"""
    return GoogleSearchClient()


def get_gemini_client():
    """GeminiClientを取得"""
    return GeminiClient()


def get_google_maps_client():
    """GoogleMapsClientを取得"""
    return GoogleMapsClient()


# エージェント
def get_scout_agent():
    """ScoutAgentを取得"""
    return ScoutAgent(
        oshi_repo=get_oshi_repository(),
        info_repo=get_info_repository(),
        search_client=get_google_search_client(),
        network_repo=get_network_repository(),
    )


def get_priority_agent():
    """PriorityAgentを取得"""
    return PriorityAgent(
        info_repo=get_info_repository(),
        gemini_client=get_gemini_client(),
    )


def get_calendar_agent():
    """CalendarAgentを取得"""
    return CalendarAgent(
        event_repo=get_event_repository(),
    )


def get_trip_agent():
    """TripAgentを取得"""
    return TripAgent(
        event_repo=get_event_repository(),
        trip_repo=get_trip_repository(),
        maps_client=get_google_maps_client(),
        gemini_client=get_gemini_client(),
    )


def get_budget_agent():
    """BudgetAgentを取得"""
    return BudgetAgent(
        expense_repo=get_expense_repository(),
        gemini_client=get_gemini_client(),
    )


def get_root_agent():
    """RootAgentを取得"""
    return RootAgent(
        oshi_repo=get_oshi_repository(),
        scout_agent=get_scout_agent(),
        priority_agent=get_priority_agent(),
        gemini_client=get_gemini_client(),
        info_repo=get_info_repository(),
        network_repo=get_network_repository(),
    )


# 認証・認可
def verify_internal_api_key(x_internal_api_key: Optional[str] = Header(None)):
    """Internal API Keyを検証（BFF認証用）"""
    if not settings.internal_api_key:
        raise HTTPException(status_code=500, detail="Internal API key is not configured")

    if not x_internal_api_key or x_internal_api_key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail="Forbidden")


def get_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    """X-User-IdヘッダーからユーザーIDを取得"""
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-Id header is required")
    return x_user_id
