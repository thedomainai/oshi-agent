"""Google Calendar APIクライアント"""
from datetime import datetime
from typing import Optional

import structlog
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from tenacity import retry, stop_after_attempt, wait_exponential

logger = structlog.get_logger(__name__)


class GoogleCalendarClient:
    """Google Calendar APIクライアント"""

    def __init__(self, access_token: str):
        """
        Args:
            access_token: OAuth2アクセストークン
        """
        self.credentials = Credentials(token=access_token)
        self.service = build("calendar", "v3", credentials=self.credentials)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def create_event(
        self,
        summary: str,
        start_time: datetime,
        end_time: Optional[datetime] = None,
        location: Optional[str] = None,
        description: Optional[str] = None,
    ) -> str:
        """カレンダーイベントを作成

        Args:
            summary: イベント名
            start_time: 開始日時
            end_time: 終了日時（省略時は開始日時+1時間）
            location: 場所
            description: 説明

        Returns:
            作成されたイベントID
        """
        try:
            if end_time is None:
                # 終了時刻が未指定の場合は開始時刻+1時間
                from datetime import timedelta

                end_time = start_time + timedelta(hours=1)

            event_body = {
                "summary": summary,
                "start": {
                    "dateTime": start_time.isoformat(),
                    "timeZone": "Asia/Tokyo",
                },
                "end": {
                    "dateTime": end_time.isoformat(),
                    "timeZone": "Asia/Tokyo",
                },
            }

            if location:
                event_body["location"] = location

            if description:
                event_body["description"] = description

            logger.info(
                "calendar_create_event_start",
                summary=summary,
                start_time=start_time.isoformat(),
            )

            event = (
                self.service.events()
                .insert(calendarId="primary", body=event_body)
                .execute()
            )

            event_id = event["id"]
            logger.info(
                "calendar_create_event_success",
                summary=summary,
                event_id=event_id,
            )
            return event_id

        except Exception as e:
            logger.error("calendar_create_event_failed", summary=summary, error=str(e))
            raise
