"""ワークフロー実行結果のPydanticモデル"""
from typing import Any, Optional
from pydantic import BaseModel


class ScoutWorkflowResult(BaseModel):
    """Scout Workflow実行結果"""

    oshi_id: str
    oshi_name: str
    collected_count: int
    new_info_ids: list[str]
    priority_results: dict[str, str]


class NetworkScoutResult(BaseModel):
    """Network Scout実行結果"""

    oshi_id: str
    oshi_name: str
    direct_count: int
    network_count: int
    total_count: int
    new_info_ids: list[str]
    priority_results: dict[str, str]


class NetworkDiscoverResult(BaseModel):
    """Network Discover実行結果"""

    oshi_id: str
    oshi_name: str
    discovered_count: int
    nodes: list[dict[str, Any]]


class EventInfo(BaseModel):
    """イベント情報抽出結果"""

    is_event: bool
    title: Optional[str] = None
    start_datetime: Optional[str] = None
    end_datetime: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class DiscoveredNode(BaseModel):
    """発見されたネットワークノード"""

    name: str
    node_type: str
    ring: int
    relationship: str
    search_queries: list[str]
