"""Gemini APIクライアント"""
import json
from typing import Any, Optional

import google.generativeai as genai
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings
from app.models.info import Priority

logger = structlog.get_logger(__name__)


class GeminiClient:
    """Gemini APIクライアント"""

    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def generate(self, prompt: str) -> str:
        """テキスト生成

        Args:
            prompt: プロンプト

        Returns:
            生成されたテキスト
        """
        try:
            logger.info("gemini_generate_start", prompt_length=len(prompt))
            response = self.model.generate_content(prompt)
            result = response.text
            logger.info("gemini_generate_success", result_length=len(result))
            return result
        except Exception as e:
            logger.error("gemini_generate_failed", error=str(e))
            raise

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def classify_priority(
        self, title: str, url: str, snippet: Optional[str] = None
    ) -> Priority:
        """情報の重要度を判定

        Args:
            title: 情報のタイトル
            url: 情報のURL
            snippet: 情報のスニペット（追加コンテキスト）

        Returns:
            重要度（urgent, important, normal）
        """
        try:
            snippet_section = f"\n概要: {snippet}" if snippet else ""

            prompt = f"""あなたは推し活（ファン活動）の情報を分析する専門家です。
以下の情報の重要度を、ファンの視点で判定してください。

タイトル: {title}
URL: {url}{snippet_section}

## 判定基準（見逃した場合のダメージで分類）

**urgent（見逃すと取り返しがつかない）**:
- チケットの先行販売・一般販売の開始や申込期限
- 抽選申込の受付開始・締切
- 限定グッズ・限定商品の発売開始
- ファンクラブの入会・更新期限
- 放送・配信の時間指定イベント（生放送など）
- 期間限定のキャンペーン・コラボ

**important（知っておくべき重要情報）**:
- 新イベント・ライブ・コンサートの告知
- 新曲・アルバム・DVD/Blu-rayの発売情報
- テレビ・ラジオ・雑誌への出演情報
- グループやメンバーに関する重要な発表
- ファンミーティングの開催告知

**normal（日常的な情報）**:
- ブログ・SNSの日常的な更新
- 過去のイベントのレポート・感想記事
- ニュースのまとめ記事
- ファンの口コミ・レビュー

以下のJSON形式のみで回答してください:
{{"priority": "urgent|important|normal", "reason": "判定理由（20字以内）"}}
"""

            logger.info(
                "classify_priority_start", title=title, url_length=len(url)
            )
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # JSONパース
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            result = json.loads(result_text)
            priority_str = result.get("priority", "normal")
            priority = Priority(priority_str)

            logger.info(
                "classify_priority_success",
                title=title,
                priority=priority.value,
                reason=result.get("reason", ""),
            )
            return priority

        except Exception as e:
            logger.error("classify_priority_failed", title=title, error=str(e))
            # エラー時はnormalを返す
            return Priority.NORMAL

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def generate_oshi_summary(
        self, oshi_name: str, infos: list[dict[str, Any]]
    ) -> str:
        """推しの最新活動サマリーを生成

        Args:
            oshi_name: 推しの名前
            infos: 収集した情報のリスト

        Returns:
            活動サマリーテキスト
        """
        try:
            if not infos:
                return f"{oshi_name}さんに関する最新情報はまだ収集されていません。しばらくお待ちください。"

            infos_text = "\n".join(
                [
                    f"- {info.get('title', '')} ({info.get('url', '')})"
                    for info in infos[:10]
                ]
            )

            prompt = f"""あなたは推し活（ファン活動）のアシスタントです。
以下の収集情報をもとに、「{oshi_name}」の直近の活動サマリーを作成してください。

## 収集した情報:
{infos_text}

## 作成ルール:
- ファンが読んで嬉しくなるような、わかりやすいサマリーにしてください
- 特に重要な情報（チケット、イベント、新作発表）があれば強調してください
- 3〜5文で簡潔にまとめてください
- 「〜ですね！」「〜しましょう！」のような親しみやすいトーンで書いてください
"""

            logger.info(
                "generate_oshi_summary_start",
                oshi_name=oshi_name,
                info_count=len(infos),
            )
            response = self.model.generate_content(prompt)
            summary = response.text.strip()

            logger.info(
                "generate_oshi_summary_success",
                oshi_name=oshi_name,
                summary_length=len(summary),
            )
            return summary

        except Exception as e:
            logger.error(
                "generate_oshi_summary_failed",
                oshi_name=oshi_name,
                error=str(e),
            )
            return f"{oshi_name}さんの情報を収集しました。詳細はタイムラインをご確認ください。"

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def extract_event_info(
        self, title: str, content: str
    ) -> Optional[dict[str, Any]]:
        """情報からイベント情報を抽出

        Args:
            title: 情報のタイトル
            content: 情報の内容

        Returns:
            イベント情報（日時、場所など）、イベントでない場合はNone
        """
        try:
            prompt = f"""以下の情報からイベント情報を抽出してください。

タイトル: {title}
内容: {content}

イベント（ライブ、握手会、イベント出演など）の情報がある場合、以下のJSON形式で回答してください:
{{
    "is_event": true,
    "title": "イベント名",
    "start_datetime": "2024-12-25T19:00:00",
    "end_datetime": "2024-12-25T21:00:00",
    "location": "会場名",
    "description": "イベント詳細"
}}

イベント情報がない場合:
{{"is_event": false}}

日時はISO 8601形式で記述してください。
"""

            logger.info(
                "extract_event_info_start", title=title, content_length=len(content)
            )
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # JSONパース
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            result_text = result_text.strip()

            result = json.loads(result_text)

            if not result.get("is_event", False):
                logger.info("extract_event_info_no_event", title=title)
                return None

            logger.info("extract_event_info_success", title=title, event_title=result.get("title"))
            return result

        except Exception as e:
            logger.error("extract_event_info_failed", title=title, error=str(e))
            return None

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def generate_trip_advice(
        self, departure: str, destination: str, event_date: str
    ) -> str:
        """遠征のアドバイスを生成

        Args:
            departure: 出発地
            destination: 目的地
            event_date: イベント日時

        Returns:
            アドバイステキスト
        """
        try:
            prompt = f"""以下の遠征について、アドバイスを生成してください。

出発地: {departure}
目的地: {destination}
イベント日: {event_date}

以下の観点でアドバイスをお願いします:
- 移動手段の選択肢と推奨
- 前泊/後泊の必要性
- 予算の目安
- 注意点やTips

簡潔に3-5文でまとめてください。
"""

            logger.info(
                "generate_trip_advice_start",
                departure=departure,
                destination=destination,
            )
            response = self.model.generate_content(prompt)
            advice = response.text.strip()

            logger.info(
                "generate_trip_advice_success",
                departure=departure,
                destination=destination,
                advice_length=len(advice),
            )
            return advice

        except Exception as e:
            logger.error(
                "generate_trip_advice_failed",
                departure=departure,
                destination=destination,
                error=str(e),
            )
            raise

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def generate_budget_advice(
        self, expenses: list[dict[str, Any]], budget: Optional[int] = None
    ) -> str:
        """予算管理のアドバイスを生成

        Args:
            expenses: 支出データのリスト
            budget: 予算（任意）

        Returns:
            アドバイステキスト
        """
        try:
            expenses_summary = json.dumps(expenses, ensure_ascii=False, indent=2)
            budget_text = f"予算: {budget}円" if budget else "予算未設定"

            prompt = f"""以下の推し活支出データに基づいて、予算管理のアドバイスを生成してください。

{budget_text}

支出データ:
{expenses_summary}

以下の観点でアドバイスをお願いします:
- カテゴリ別の支出傾向
- 予算に対する評価（予算設定時）
- 節約のTipsや今後の注意点

簡潔に3-5文でまとめてください。
"""

            logger.info("generate_budget_advice_start", expenses_count=len(expenses))
            response = self.model.generate_content(prompt)
            advice = response.text.strip()

            logger.info(
                "generate_budget_advice_success",
                expenses_count=len(expenses),
                advice_length=len(advice),
            )
            return advice

        except Exception as e:
            logger.error(
                "generate_budget_advice_failed",
                expenses_count=len(expenses),
                error=str(e),
            )
            raise
