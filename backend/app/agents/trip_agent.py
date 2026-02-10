"""Trip Agent - 遠征プラン生成エージェント"""
import structlog

from app.external.gemini_client import GeminiClient
from app.external.google_maps import GoogleMapsClient
from app.models.trip_plan import (
    AccommodationInfo,
    TransportInfo,
    TripPlanCreate,
)
from app.repositories.event_repository import EventRepository
from app.repositories.trip_repository import TripRepository

logger = structlog.get_logger(__name__)


class TripAgent:
    """遠征プランを自動生成するエージェント"""

    def __init__(
        self,
        event_repo: EventRepository,
        trip_repo: TripRepository,
        maps_client: GoogleMapsClient,
        gemini_client: GeminiClient,
    ):
        self.event_repo = event_repo
        self.trip_repo = trip_repo
        self.maps_client = maps_client
        self.gemini_client = gemini_client

    async def generate_plan(
        self, event_id: str, user_id: str, departure: str
    ) -> str:
        """遠征プランを生成

        Args:
            event_id: イベントID
            user_id: ユーザーID
            departure: 出発地

        Returns:
            作成された遠征プランID
        """
        try:
            logger.info(
                "trip_generate_start",
                event_id=event_id,
                user_id=user_id,
                departure=departure,
            )

            # イベント情報を取得
            event = self.event_repo.get_by_id(event_id)
            if not event:
                raise ValueError(f"Event not found: {event_id}")

            destination = event.location or "会場未定"

            # Google Maps APIでルート計算
            directions = self.maps_client.get_directions(departure, destination)

            if directions:
                # 交通情報を設定
                transport = TransportInfo(
                    mode="transit",
                    duration_minutes=directions["duration_seconds"] // 60,
                    distance_km=directions["distance_meters"] / 1000.0,
                    estimated_cost=self._estimate_transport_cost(
                        directions["distance_meters"] / 1000.0
                    ),
                    route_description=directions["duration_text"]
                    + " - "
                    + directions["distance_text"],
                )
            else:
                # ルート取得失敗時のデフォルト
                transport = TransportInfo(
                    mode="transit",
                    duration_minutes=None,
                    distance_km=None,
                    estimated_cost=None,
                    route_description="ルート情報を取得できませんでした",
                )

            # 宿泊情報（簡易判定: 距離100km以上なら1泊）
            needs_accommodation = (
                transport.distance_km and transport.distance_km > 100
            )
            accommodation = AccommodationInfo(
                nights=1 if needs_accommodation else 0,
                estimated_cost=8000 if needs_accommodation else 0,
                notes="遠方のため前泊を推奨" if needs_accommodation else "",
            )

            # 合計費用
            total_cost = (transport.estimated_cost or 0) + (
                accommodation.estimated_cost or 0
            )

            # Geminiでアドバイス生成
            advice = self.gemini_client.generate_trip_advice(
                departure=departure,
                destination=destination,
                event_date=event.start_datetime.isoformat(),
            )

            # 遠征プランを作成
            plan_data = TripPlanCreate(
                event_id=event_id,
                departure=departure,
                destination=destination,
                transport=transport,
                accommodation=accommodation,
                total_estimated_cost=total_cost,
                advice=advice,
            )

            plan = self.trip_repo.create(user_id, plan_data)

            logger.info(
                "trip_generate_success",
                event_id=event_id,
                plan_id=plan.id,
                total_cost=total_cost,
            )
            return plan.id

        except Exception as e:
            logger.error(
                "trip_generate_failed",
                event_id=event_id,
                error=str(e),
            )
            raise

    def _estimate_transport_cost(self, distance_km: float) -> int:
        """交通費を概算（簡易計算）

        Args:
            distance_km: 距離（km）

        Returns:
            概算費用（円）
        """
        # 簡易計算: 10km = 200円として概算
        return int(distance_km * 20)
