"""ADK Tool Functions - エージェントが使用するツール関数

各ツールは plain function として定義し、ADK の LlmAgent から呼び出されます。
内部的に既存のリポジトリ・外部クライアントを使用します。
"""
import structlog

from app.config import settings
from app.external.google_search import GoogleSearchClient
from app.models.info import CollectedInfoCreate, Priority
from app.repositories.firestore_client import get_firestore_client
from app.repositories.info_repository import InfoRepository

logger = structlog.get_logger(__name__)

# 遅延初期化用のシングルトン
_search_client = None
_info_repo = None


def _get_search_client() -> GoogleSearchClient:
    global _search_client
    if _search_client is None:
        _search_client = GoogleSearchClient()
    return _search_client


def _get_info_repo() -> InfoRepository:
    global _info_repo
    if _info_repo is None:
        _info_repo = InfoRepository(get_firestore_client())
    return _info_repo


def search_oshi_info(oshi_name: str, additional_keywords: str = "") -> dict:
    """推しに関する最新情報をWeb上から検索します。

    Args:
        oshi_name: 推しの名前（例: "星野源", "YOASOBI"）
        additional_keywords: 追加の検索キーワード（例: "ライブ チケット"）

    Returns:
        検索結果のリスト。各結果にはtitle, url, snippetが含まれます。
    """
    try:
        client = _get_search_client()
        query = f"{oshi_name} 最新情報"
        if additional_keywords:
            query += f" {additional_keywords}"

        results = client.search(query, num_results=10)

        formatted = [
            {
                "title": r.get("title", ""),
                "url": r.get("link", ""),
                "snippet": r.get("snippet", ""),
            }
            for r in results
        ]

        logger.info("adk_search_complete", query=query, count=len(formatted))
        return {"results": formatted, "count": len(formatted)}
    except Exception as e:
        logger.error("adk_search_failed", error=str(e))
        return {"results": [], "count": 0, "error": str(e)}


def save_info(oshi_id: str, title: str, url: str, snippet: str = "") -> dict:
    """検索で見つかった情報をデータベースに保存します。
    既に保存済みのURLは重複チェックによりスキップされます。

    Args:
        oshi_id: 推しのID
        title: 情報のタイトル
        url: 情報のURL
        snippet: 情報の概要テキスト

    Returns:
        保存結果。saved=trueの場合はinfo_idも返されます。
    """
    try:
        repo = _get_info_repo()

        existing = repo.find_by_url(oshi_id, url)
        if existing:
            return {"saved": False, "reason": "duplicate", "url": url}

        info_data = CollectedInfoCreate(
            title=title,
            url=url,
            snippet=snippet,
            oshi_id=oshi_id,
        )
        created = repo.create(info_data)

        logger.info("adk_info_saved", oshi_id=oshi_id, info_id=created.id)
        return {"saved": True, "info_id": created.id, "title": title}
    except Exception as e:
        logger.error("adk_info_save_failed", error=str(e))
        return {"saved": False, "error": str(e)}


def get_pending_infos(oshi_id: str) -> dict:
    """まだ重要度が判定されていない情報（priority=normal）のリストを取得します。

    Args:
        oshi_id: 推しのID

    Returns:
        未判定情報のリスト。各情報にはid, title, url, snippetが含まれます。
    """
    try:
        repo = _get_info_repo()
        infos = repo.get_all_by_oshi(oshi_id)

        pending = [
            {
                "id": info.id,
                "title": info.title,
                "url": info.url,
                "snippet": info.snippet or "",
            }
            for info in infos
            if info.priority == Priority.NORMAL
        ]

        return {"infos": pending, "count": len(pending)}
    except Exception as e:
        logger.error("adk_get_pending_failed", error=str(e))
        return {"infos": [], "count": 0, "error": str(e)}


def classify_and_save_priority(
    info_id: str, priority: str, reason: str
) -> dict:
    """情報の重要度を分類して保存します。

    Args:
        info_id: 情報のID
        priority: 重要度。"urgent"（見逃すと取り返しがつかない）, "important"（知っておくべき）, "normal"（日常的）のいずれか
        reason: 判定理由の短い説明

    Returns:
        更新結果
    """
    try:
        repo = _get_info_repo()

        priority_enum = Priority(priority)
        repo.update_priority(info_id, priority_enum)

        logger.info(
            "adk_priority_saved",
            info_id=info_id,
            priority=priority,
            reason=reason,
        )
        return {
            "updated": True,
            "info_id": info_id,
            "priority": priority,
            "reason": reason,
        }
    except Exception as e:
        logger.error("adk_priority_save_failed", error=str(e))
        return {"updated": False, "info_id": info_id, "error": str(e)}
