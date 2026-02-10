"""TripAgentのテスト"""
import pytest
from unittest.mock import MagicMock
from datetime import datetime

from app.agents.trip_agent import TripAgent
from app.models.trip_plan import (
    TripPlanModel,
    TripPlanCreate,
    TransportInfo,
    AccommodationInfo,
)
from app.models.event import EventModel
from app.repositories.event_repository import EventRepository
from app.repositories.trip_repository import TripRepository
from app.external.google_maps import GoogleMapsClient
from app.external.gemini_client import GeminiClient


@pytest.fixture
def mock_event_repo():
    """EventRepositoryのモック"""
    return MagicMock(spec=EventRepository)


@pytest.fixture
def mock_trip_repo():
    """TripRepositoryのモック"""
    return MagicMock(spec=TripRepository)


@pytest.fixture
def mock_maps_client():
    """GoogleMapsClientのモック"""
    return MagicMock(spec=GoogleMapsClient)


@pytest.fixture
def mock_gemini_client():
    """GeminiClientのモック"""
    return MagicMock(spec=GeminiClient)


@pytest.fixture
def trip_agent(
    mock_event_repo, mock_trip_repo, mock_maps_client, mock_gemini_client
):
    """TripAgentインスタンス"""
    return TripAgent(
        event_repo=mock_event_repo,
        trip_repo=mock_trip_repo,
        maps_client=mock_maps_client,
        gemini_client=mock_gemini_client,
    )


@pytest.mark.asyncio
async def test_generate_plan_success_with_directions(
    trip_agent, mock_event_repo, mock_trip_repo, mock_maps_client, mock_gemini_client
):
    """ルート情報ありで遠征プランを生成できる"""
    # モックの設定
    event = EventModel(
        id="event1",
        user_id="user1",
        oshi_id="oshi1",
        title="ライブイベント",
        start_datetime=datetime(2024, 12, 25, 19, 0),
        location="東京",
        is_registered=True,
        updated_at=datetime.utcnow(),
    )
    mock_event_repo.get_by_id.return_value = event

    # Google Maps APIのレスポンス（短距離）
    mock_maps_client.get_directions.return_value = {
        "distance_meters": 50000,  # 50km
        "distance_text": "50 km",
        "duration_seconds": 3600,  # 1時間
        "duration_text": "1時間",
    }

    # Geminiのアドバイス
    mock_gemini_client.generate_trip_advice.return_value = "電車での移動をおすすめします。"

    # 作成されたプラン
    created_plan = TripPlanModel(
        id="plan1",
        event_id="event1",
        departure="大阪",
        destination="東京",
        transport=TransportInfo(
            mode="transit",
            duration_minutes=60,
            distance_km=50.0,
            estimated_cost=1000,
            route_description="1時間 - 50 km",
        ),
        accommodation=AccommodationInfo(
            nights=0,
            estimated_cost=0,
            notes="",
        ),
        total_estimated_cost=1000,
        advice="電車での移動をおすすめします。",
        updated_at=datetime.utcnow(),
    )
    mock_trip_repo.create.return_value = created_plan

    # 実行
    result = await trip_agent.generate_plan(
        event_id="event1",
        user_id="user1",
        departure="大阪",
    )

    # 検証
    assert result == "plan1"

    # メソッド呼び出しの確認
    mock_event_repo.get_by_id.assert_called_once_with("event1")
    mock_maps_client.get_directions.assert_called_once_with("大阪", "東京")
    mock_gemini_client.generate_trip_advice.assert_called_once()
    mock_trip_repo.create.assert_called_once()


@pytest.mark.asyncio
async def test_generate_plan_long_distance_with_accommodation(
    trip_agent, mock_event_repo, mock_trip_repo, mock_maps_client, mock_gemini_client
):
    """長距離の場合、宿泊が推奨される"""
    # モックの設定
    event = EventModel(
        id="event1",
        user_id="user1",
        oshi_id="oshi1",
        title="ライブイベント",
        start_datetime=datetime(2024, 12, 25, 19, 0),
        location="東京",
        is_registered=True,
        updated_at=datetime.utcnow(),
    )
    mock_event_repo.get_by_id.return_value = event

    # Google Maps APIのレスポンス（長距離）
    mock_maps_client.get_directions.return_value = {
        "distance_meters": 500000,  # 500km
        "distance_text": "500 km",
        "duration_seconds": 18000,  # 5時間
        "duration_text": "5時間",
    }

    # Geminiのアドバイス
    mock_gemini_client.generate_trip_advice.return_value = (
        "遠方のため前泊を推奨します。"
    )

    # 作成されたプラン
    created_plan = TripPlanModel(
        id="plan1",
        event_id="event1",
        departure="大阪",
        destination="東京",
        transport=TransportInfo(
            mode="transit",
            duration_minutes=300,
            distance_km=500.0,
            estimated_cost=10000,
            route_description="5時間 - 500 km",
        ),
        accommodation=AccommodationInfo(
            nights=1,
            estimated_cost=8000,
            notes="遠方のため前泊を推奨",
        ),
        total_estimated_cost=18000,
        advice="遠方のため前泊を推奨します。",
        updated_at=datetime.utcnow(),
    )
    mock_trip_repo.create.return_value = created_plan

    # 実行
    result = await trip_agent.generate_plan(
        event_id="event1",
        user_id="user1",
        departure="大阪",
    )

    # 検証
    assert result == "plan1"

    # 宿泊プランが作成されていることを確認
    call_args = mock_trip_repo.create.call_args
    plan_data = call_args[0][1]
    assert plan_data.accommodation.nights == 1
    assert plan_data.accommodation.estimated_cost == 8000


@pytest.mark.asyncio
async def test_generate_plan_no_directions(
    trip_agent, mock_event_repo, mock_trip_repo, mock_maps_client, mock_gemini_client
):
    """ルート情報が取得できない場合のフォールバック"""
    # モックの設定
    event = EventModel(
        id="event1",
        user_id="user1",
        oshi_id="oshi1",
        title="ライブイベント",
        start_datetime=datetime(2024, 12, 25, 19, 0),
        location="東京",
        is_registered=True,
        updated_at=datetime.utcnow(),
    )
    mock_event_repo.get_by_id.return_value = event

    # Google Maps APIが失敗
    mock_maps_client.get_directions.return_value = None

    # Geminiのアドバイス
    mock_gemini_client.generate_trip_advice.return_value = "移動手段をご検討ください。"

    # 作成されたプラン
    created_plan = TripPlanModel(
        id="plan1",
        event_id="event1",
        departure="大阪",
        destination="東京",
        transport=TransportInfo(
            mode="transit",
            duration_minutes=None,
            distance_km=None,
            estimated_cost=None,
            route_description="ルート情報を取得できませんでした",
        ),
        accommodation=AccommodationInfo(
            nights=0,
            estimated_cost=0,
            notes="",
        ),
        total_estimated_cost=0,
        advice="移動手段をご検討ください。",
        updated_at=datetime.utcnow(),
    )
    mock_trip_repo.create.return_value = created_plan

    # 実行
    result = await trip_agent.generate_plan(
        event_id="event1",
        user_id="user1",
        departure="大阪",
    )

    # 検証
    assert result == "plan1"

    # デフォルト値が使用されていることを確認
    call_args = mock_trip_repo.create.call_args
    plan_data = call_args[0][1]
    assert plan_data.transport.route_description == "ルート情報を取得できませんでした"


@pytest.mark.asyncio
async def test_generate_plan_event_not_found(
    trip_agent, mock_event_repo, mock_trip_repo, mock_maps_client, mock_gemini_client
):
    """イベントが存在しない場合エラーになる"""
    # モックの設定
    mock_event_repo.get_by_id.return_value = None

    # 実行と検証
    with pytest.raises(ValueError, match="Event not found"):
        await trip_agent.generate_plan(
            event_id="invalid_event",
            user_id="user1",
            departure="大阪",
        )

    # Mapsクライアントが呼ばれていないことを確認
    mock_maps_client.get_directions.assert_not_called()
    mock_gemini_client.generate_trip_advice.assert_not_called()
    mock_trip_repo.create.assert_not_called()


def test_estimate_transport_cost(trip_agent):
    """交通費の概算計算が正しい"""
    # 10km = 200円
    assert trip_agent._estimate_transport_cost(10.0) == 200

    # 100km = 2000円
    assert trip_agent._estimate_transport_cost(100.0) == 2000

    # 0km = 0円
    assert trip_agent._estimate_transport_cost(0.0) == 0

    # 小数点も対応
    assert trip_agent._estimate_transport_cost(5.5) == 110
