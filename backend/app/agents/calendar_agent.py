"""Calendar Agent - カレンダー登録エージェント"""
import structlog

from app.external.google_calendar import GoogleCalendarClient
from app.repositories.event_repository import EventRepository

logger = structlog.get_logger(__name__)


class CalendarAgent:
    """イベント情報をカレンダーに登録するエージェント"""

    def __init__(
        self,
        event_repo: EventRepository,
    ):
        self.event_repo = event_repo

    async def register_event(self, event_id: str, oauth_token: str) -> str:
        """イベントをGoogle Calendarに登録

        Args:
            event_id: イベントID
            oauth_token: OAuth2アクセストークン

        Returns:
            Google CalendarのイベントID
        """
        try:
            logger.info(
                "calendar_register_start",
                event_id=event_id,
            )

            # イベント情報を取得
            event = self.event_repo.get_by_id(event_id)
            if not event:
                raise ValueError(f"Event not found: {event_id}")

            # すでに登録済みの場合
            if event.calendar_event_id:
                logger.info(
                    "calendar_already_registered",
                    event_id=event_id,
                    calendar_event_id=event.calendar_event_id,
                )
                return event.calendar_event_id

            # Google Calendarクライアントを作成
            calendar_client = GoogleCalendarClient(oauth_token)

            # カレンダーに登録
            calendar_event_id = calendar_client.create_event(
                summary=event.title,
                start_time=event.start_datetime,
                end_time=event.end_datetime,
                location=event.location,
                description=event.description,
            )

            # Firestoreを更新
            self.event_repo.update_calendar_id(event_id, calendar_event_id)

            logger.info(
                "calendar_register_success",
                event_id=event_id,
                calendar_event_id=calendar_event_id,
            )
            return calendar_event_id

        except Exception as e:
            logger.error(
                "calendar_register_failed",
                event_id=event_id,
                error=str(e),
            )
            raise
