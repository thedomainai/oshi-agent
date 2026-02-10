"""Google Maps APIクライアント"""
from typing import Any, Optional

import structlog
from googleapiclient.discovery import build
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

logger = structlog.get_logger(__name__)


class GoogleMapsClient:
    """Google Maps APIクライアント（Directions API）"""

    def __init__(self):
        self.api_key = settings.google_maps_api_key

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def get_directions(
        self, origin: str, destination: str, mode: str = "transit"
    ) -> Optional[dict[str, Any]]:
        """ルート検索

        Args:
            origin: 出発地
            destination: 目的地
            mode: 移動手段（transit, driving, walking, bicycling）

        Returns:
            ルート情報（distance, duration, stepsなど）
        """
        try:
            import httpx

            logger.info(
                "maps_directions_start",
                origin=origin,
                destination=destination,
                mode=mode,
            )

            url = "https://maps.googleapis.com/maps/api/directions/json"
            params = {
                "origin": origin,
                "destination": destination,
                "mode": mode,
                "language": "ja",
                "key": self.api_key,
            }

            response = httpx.get(url, params=params, timeout=30.0)
            response.raise_for_status()
            data = response.json()

            if data["status"] != "OK":
                logger.warning(
                    "maps_directions_error",
                    origin=origin,
                    destination=destination,
                    status=data["status"],
                )
                return None

            routes = data.get("routes", [])
            if not routes:
                return None

            route = routes[0]
            leg = route["legs"][0]

            result = {
                "distance_meters": leg["distance"]["value"],
                "distance_text": leg["distance"]["text"],
                "duration_seconds": leg["duration"]["value"],
                "duration_text": leg["duration"]["text"],
                "start_address": leg["start_address"],
                "end_address": leg["end_address"],
                "steps": [
                    {
                        "instruction": step.get("html_instructions", ""),
                        "distance": step["distance"]["text"],
                        "duration": step["duration"]["text"],
                    }
                    for step in leg.get("steps", [])
                ],
            }

            logger.info(
                "maps_directions_success",
                origin=origin,
                destination=destination,
                distance=result["distance_text"],
                duration=result["duration_text"],
            )
            return result

        except Exception as e:
            logger.error(
                "maps_directions_failed",
                origin=origin,
                destination=destination,
                error=str(e),
            )
            raise

    def get_distance(self, origin: str, destination: str) -> Optional[float]:
        """距離を取得（km）

        Args:
            origin: 出発地
            destination: 目的地

        Returns:
            距離（km）
        """
        try:
            result = self.get_directions(origin, destination)
            if result:
                return result["distance_meters"] / 1000.0
            return None
        except Exception as e:
            logger.error(
                "get_distance_failed",
                origin=origin,
                destination=destination,
                error=str(e),
            )
            return None
