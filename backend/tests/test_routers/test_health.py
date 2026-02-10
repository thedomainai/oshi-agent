"""ヘルスチェックエンドポイントのテスト"""
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_ヘルスチェックが正常に動作する():
    """ヘルスチェックエンドポイントが正常なレスポンスを返す"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_ヘルスチェックのレスポンス形式():
    """ヘルスチェックのレスポンスが正しいJSON形式"""
    response = client.get("/health")
    data = response.json()
    assert "status" in data
    assert isinstance(data["status"], str)
    assert data["status"] == "healthy"


def test_ヘルスチェックのHTTPメソッド():
    """ヘルスチェックはGETメソッドのみ受け付ける"""
    # GETは成功
    response = client.get("/health")
    assert response.status_code == 200

    # POSTは失敗
    response = client.post("/health")
    assert response.status_code == 405

    # PUTは失敗
    response = client.put("/health")
    assert response.status_code == 405

    # DELETEは失敗
    response = client.delete("/health")
    assert response.status_code == 405
