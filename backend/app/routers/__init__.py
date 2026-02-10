"""FastAPIルーター"""
from app.routers.agent import router as agent_router
from app.routers.health import router as health_router

__all__ = [
    "health_router",
    "agent_router",
]
