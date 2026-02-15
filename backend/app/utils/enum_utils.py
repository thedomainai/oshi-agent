"""Enum関連のユーティリティ関数"""
from typing import Any


def enum_to_value(obj: Any) -> Any:
    """Enum型を値に変換するヘルパー

    Args:
        obj: Enum型またはその他の値

    Returns:
        Enum型の場合はその値、それ以外はそのまま返す

    Examples:
        >>> from enum import Enum
        >>> class Color(Enum):
        ...     RED = 1
        ...     BLUE = 2
        >>> enum_to_value(Color.RED)
        1
        >>> enum_to_value("plain_value")
        'plain_value'
    """
    return obj.value if hasattr(obj, "value") else obj
