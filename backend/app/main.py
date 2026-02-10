"""FastAPIメインアプリケーション"""
import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.logging_config import configure_logging
from app.routers import agent_router, health_router

# ロギング設定
configure_logging()
logger = structlog.get_logger(__name__)

# FastAPIアプリケーション
app = FastAPI(
    title="Oshi Agent API",
    description="AI推し活マネージャー - マルチエージェントバックエンドAPI",
    version="1.0.0",
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 例外ハンドラー
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """バリデーションエラーハンドラー"""
    logger.warning(
        "validation_error",
        path=request.url.path,
        errors=exc.errors(),
    )
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": exc.body,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """一般的な例外ハンドラー"""
    logger.error(
        "unhandled_exception",
        path=request.url.path,
        error=str(exc),
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ルーター登録
app.include_router(health_router)
app.include_router(agent_router)


# 起動ログ
@app.on_event("startup")
async def startup_event():
    """起動時ログ"""
    logger.info(
        "app_startup",
        project=settings.google_cloud_project,
        frontend_url=settings.frontend_url,
    )


@app.on_event("shutdown")
async def shutdown_event():
    """シャットダウン時ログ"""
    logger.info("app_shutdown")


# ルートエンドポイント
@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Oshi Agent API",
        "version": "1.0.0",
        "docs": "/docs",
    }
