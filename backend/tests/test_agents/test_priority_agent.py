"""PriorityAgentのテスト"""
import pytest
from unittest.mock import MagicMock
from datetime import datetime

from app.agents.priority_agent import PriorityAgent
from app.models.info import CollectedInfoModel, Priority
from app.repositories.info_repository import InfoRepository
from app.external.gemini_client import GeminiClient


@pytest.fixture
def mock_info_repo():
    """InfoRepositoryのモック"""
    return MagicMock(spec=InfoRepository)


@pytest.fixture
def mock_gemini_client():
    """GeminiClientのモック"""
    return MagicMock(spec=GeminiClient)


@pytest.fixture
def priority_agent(mock_info_repo, mock_gemini_client):
    """PriorityAgentインスタンス"""
    return PriorityAgent(
        info_repo=mock_info_repo,
        gemini_client=mock_gemini_client,
    )


@pytest.mark.asyncio
async def test_judge_priority_success(
    priority_agent, mock_info_repo, mock_gemini_client
):
    """重要度判定が成功するケース"""
    # モックの設定
    info1 = CollectedInfoModel(
        id="info1",
        oshi_id="oshi1",
        title="チケット販売開始！",
        url="https://example.com/ticket",
        snippet="明日から受付開始",
        priority=Priority.NORMAL,
        collected_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    info2 = CollectedInfoModel(
        id="info2",
        oshi_id="oshi1",
        title="新曲発表",
        url="https://example.com/new-song",
        snippet="来月リリース",
        priority=Priority.NORMAL,
        collected_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    mock_info_repo.get_by_id.side_effect = [info1, info2]

    # Geminiの判定結果
    mock_gemini_client.classify_priority.side_effect = [
        Priority.URGENT,
        Priority.IMPORTANT,
    ]

    # update_priorityは成功を返す
    mock_info_repo.update_priority.return_value = True

    # 実行
    result = await priority_agent.judge_priority(["info1", "info2"])

    # 検証
    assert len(result) == 2
    assert result["info1"] == "urgent"
    assert result["info2"] == "important"

    # メソッド呼び出しの確認
    assert mock_info_repo.get_by_id.call_count == 2
    assert mock_gemini_client.classify_priority.call_count == 2
    assert mock_info_repo.update_priority.call_count == 2


@pytest.mark.asyncio
async def test_judge_priority_info_not_found(
    priority_agent, mock_info_repo, mock_gemini_client
):
    """情報が見つからないケース"""
    # モックの設定（1件目は存在、2件目は存在しない）
    info1 = CollectedInfoModel(
        id="info1",
        oshi_id="oshi1",
        title="ニュース",
        url="https://example.com/news",
        snippet="内容",
        priority=Priority.NORMAL,
        collected_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    mock_info_repo.get_by_id.side_effect = [info1, None]
    mock_gemini_client.classify_priority.return_value = Priority.NORMAL
    mock_info_repo.update_priority.return_value = True

    # 実行
    result = await priority_agent.judge_priority(["info1", "info_not_exist"])

    # 検証（存在する1件のみ判定される）
    assert len(result) == 1
    assert "info1" in result
    assert "info_not_exist" not in result

    # メソッド呼び出しの確認
    assert mock_info_repo.get_by_id.call_count == 2
    assert mock_gemini_client.classify_priority.call_count == 1
    assert mock_info_repo.update_priority.call_count == 1


@pytest.mark.asyncio
async def test_judge_priority_empty_list(
    priority_agent, mock_info_repo, mock_gemini_client
):
    """空のリストを渡すケース"""
    # 実行
    result = await priority_agent.judge_priority([])

    # 検証
    assert len(result) == 0

    # メソッド呼び出しの確認
    mock_info_repo.get_by_id.assert_not_called()
    mock_gemini_client.classify_priority.assert_not_called()
    mock_info_repo.update_priority.assert_not_called()
