"""アプリケーション設定"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """環境変数から設定を読み込む"""

    # Google Cloud
    google_cloud_project: str
    firestore_database: str = "(default)"

    # Gemini API
    gemini_api_key: str

    # Google Search API
    google_search_api_key: str
    google_search_cx: str

    # Google Maps API
    google_maps_api_key: str

    # Frontend URL (CORS)
    frontend_url: str = "http://localhost:3000"

    # Internal API Key (BFF認証用)
    internal_api_key: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# グローバル設定インスタンス
settings = Settings()
