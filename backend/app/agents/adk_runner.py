"""ADK Runner - ADK エージェントの実行ヘルパー

FastAPI エンドポイントから ADK エージェントをプログラム的に実行するための
Runner と SessionService のセットアップを提供します。
"""
import uuid

import structlog
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

from app.agents.adk_agents import scout_workflow
from app.config import settings

logger = structlog.get_logger(__name__)

# セッションサービス（インメモリ）
session_service = InMemorySessionService()

# Runner（アプリケーションライフサイクルで再利用）
runner = Runner(
    app_name="oshi-agent",
    agent=scout_workflow,
    session_service=session_service,
)


async def run_scout_workflow_adk(
    oshi_id: str, oshi_name: str, user_id: str
) -> dict:
    """ADK を使用して Scout → Priority ワークフローを実行

    Args:
        oshi_id: 推しのID
        oshi_name: 推しの名前
        user_id: ユーザーID

    Returns:
        実行結果（レスポンステキスト）
    """
    try:
        session_id = f"scout_{user_id}_{uuid.uuid4().hex[:8]}"

        session = await session_service.create_session(
            app_name="oshi-agent",
            user_id=user_id,
            session_id=session_id,
            state={"oshi_id": oshi_id, "oshi_name": oshi_name},
        )

        message = Content(
            role="user",
            parts=[
                Part.from_text(
                    f"{oshi_name}（oshi_id: {oshi_id}）の最新情報を収集して、重要度を判定してください。"
                )
            ],
        )

        logger.info(
            "adk_scout_workflow_start",
            oshi_id=oshi_id,
            oshi_name=oshi_name,
            session_id=session_id,
        )

        response_parts = []
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session.id,
            new_message=message,
        ):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        response_parts.append(part.text)

        response_text = "\n".join(response_parts)

        logger.info(
            "adk_scout_workflow_success",
            oshi_id=oshi_id,
            response_length=len(response_text),
        )

        return {
            "oshi_id": oshi_id,
            "oshi_name": oshi_name,
            "response": response_text,
            "session_id": session_id,
        }

    except Exception as e:
        logger.error(
            "adk_scout_workflow_failed",
            oshi_id=oshi_id,
            error=str(e),
        )
        raise
