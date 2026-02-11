"""ScoutAgentのテスト"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.agents.scout_agent import ScoutAgent
from app.models.info import CollectedInfoCreate, CollectedInfoModel, Priority
from app.repositories.info_repository import InfoRepository
from app.repositories.oshi_repository import OshiRepository
from app.external.google_search import GoogleSearchClient


@pytest.fixture
def mock_oshi_repo():
    """OshiRepositoryのモック"""
    return MagicMock(spec=OshiRepository)


@pytest.fixture
def mock_info_repo():
    """InfoRepositoryのモック"""
    return MagicMock(spec=InfoRepository)


@pytest.fixture
def mock_search_client():
    """GoogleSearchClientのモック"""
    return MagicMock(spec=GoogleSearchClient)


@pytest.fixture
def scout_agent(mock_oshi_repo, mock_info_repo, mock_search_client):
    """ScoutAgentインスタンス"""
    return ScoutAgent(
        oshi_repo=mock_oshi_repo,
        info_repo=mock_info_repo,
        search_client=mock_search_client,
    )


@pytest.mark.asyncio
async def test_collect_info_success(scout_agent, mock_search_client, mock_info_repo):
    """情報収集が成功するケース"""
    # モックの設定
    mock_search_client.search.return_value = [
        {
            "title": "新曲発表！",
            "link": "https://example.com/news1",
            "snippet": "2024年最新曲",
        },
        {
            "title": "ライブ開催決定",
            "link": "https://example.com/news2",
            "snippet": "12月25日開催",
        },
    ]

    # 既存チェック（すべて新規）
    mock_info_repo.find_by_url.return_value = None

    # 作成時のレスポンス
    from datetime import datetime

    mock_info_repo.create.side_effect = [
        CollectedInfoModel(
            id="info1",
            oshi_id="oshi1",
            title="新曲発表！",
            url="https://example.com/news1",
            snippet="2024年最新曲",
            priority=Priority.NORMAL,
            collected_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
        CollectedInfoModel(
            id="info2",
            oshi_id="oshi1",
            title="ライブ開催決定",
            url="https://example.com/news2",
            snippet="12月25日開催",
            priority=Priority.NORMAL,
            collected_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
    ]

    # 実行
    result = await scout_agent.collect_info(
        oshi_id="oshi1",
        oshi_name="テストアーティスト",
        official_url="https://example.com",
    )

    # 検証
    assert len(result) == 2
    assert "info1" in result
    assert "info2" in result

    # メソッド呼び出しの確認（カテゴリ未指定のため1クエリ + official_url分の合計2クエリ）
    assert mock_search_client.search.call_count >= 1
    assert mock_info_repo.find_by_url.call_count == 2
    assert mock_info_repo.create.call_count == 2


@pytest.mark.asyncio
async def test_collect_info_with_duplicates(
    scout_agent, mock_search_client, mock_info_repo
):
    """重複URLをスキップするケース"""
    from datetime import datetime

    # モックの設定
    mock_search_client.search.return_value = [
        {
            "title": "既存ニュース",
            "link": "https://example.com/old-news",
            "snippet": "古い情報",
        },
        {
            "title": "新しいニュース",
            "link": "https://example.com/new-news",
            "snippet": "新しい情報",
        },
    ]

    # 既存チェック（1件目は既存、2件目は新規）
    mock_info_repo.find_by_url.side_effect = [
        CollectedInfoModel(
            id="existing_info",
            oshi_id="oshi1",
            title="既存ニュース",
            url="https://example.com/old-news",
            snippet="古い情報",
            priority=Priority.NORMAL,
            collected_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
        None,  # 2件目は新規
    ]

    # 作成時のレスポンス（1件のみ）
    mock_info_repo.create.return_value = CollectedInfoModel(
        id="info_new",
        oshi_id="oshi1",
        title="新しいニュース",
        url="https://example.com/new-news",
        snippet="新しい情報",
        priority=Priority.NORMAL,
        collected_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    # 実行
    result = await scout_agent.collect_info(
        oshi_id="oshi1",
        oshi_name="テストアーティスト",
    )

    # 検証
    assert len(result) == 1
    assert "info_new" in result

    # メソッド呼び出しの確認
    assert mock_info_repo.create.call_count == 1


@pytest.mark.asyncio
async def test_collect_info_no_results(scout_agent, mock_search_client, mock_info_repo):
    """検索結果が0件のケース"""
    # モックの設定
    mock_search_client.search.return_value = []

    # 実行
    result = await scout_agent.collect_info(
        oshi_id="oshi1",
        oshi_name="テストアーティスト",
    )

    # 検証
    assert len(result) == 0

    # メソッド呼び出しの確認
    assert mock_search_client.search.call_count >= 1
    mock_info_repo.create.assert_not_called()
