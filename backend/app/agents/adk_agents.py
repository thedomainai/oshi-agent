"""ADK Agent Definitions - Google ADK を使用したマルチエージェント定義

Scout Agent と Priority Agent を ADK の LlmAgent として定義し、
SequentialAgent で Scout → Priority のワークフローを構築します。
"""
from google.adk.agents import LlmAgent, SequentialAgent

from app.agents.adk_tools import (
    classify_and_save_priority,
    get_pending_infos,
    save_info,
    search_oshi_info,
)

# Scout Agent: 推しの最新情報をWebから自律収集
scout_agent = LlmAgent(
    name="scout_agent",
    model="gemini-2.0-flash",
    description="推しの最新情報をWebから自律的に収集するエージェント",
    instruction="""あなたは推し活ファンのための情報収集エージェントです。
指定された推しの最新情報をWebから検索し、見つかった情報をデータベースに保存してください。

## 手順
1. search_oshi_info ツールで推しの名前を使って情報を検索してください
2. 検索結果の各項目について save_info ツールでデータベースに保存してください
3. 保存結果をまとめて報告してください（保存件数、スキップ件数）

## 注意事項
- 検索結果は全て保存してください（重複チェックは自動で行われます）
- oshi_id は入力メッセージに含まれているのでそのまま使ってください
""",
    tools=[search_oshi_info, save_info],
    output_key="scout_results",
)

# Priority Agent: 収集された情報の重要度をファン目線で判定
priority_agent = LlmAgent(
    name="priority_agent",
    model="gemini-2.0-flash",
    description="収集された情報の重要度をファン目線で判定するエージェント",
    instruction="""あなたは推し活情報の重要度を判定するエージェントです。
未判定の情報を取得し、各情報をファンの視点で分類してください。

## 判定基準（見逃した場合のダメージで分類）

**urgent（見逃すと取り返しがつかない）**:
- チケットの先行販売・一般販売の開始や申込期限
- 抽選申込の受付開始・締切
- 限定グッズ・限定商品の発売開始
- ファンクラブの入会・更新期限
- 期間限定のキャンペーン・コラボ

**important（知っておくべき重要情報）**:
- 新イベント・ライブ・コンサートの告知
- 新曲・アルバム・DVD/Blu-rayの発売情報
- テレビ・ラジオ・雑誌への出演情報
- グループやメンバーに関する重要な発表

**normal（日常的な情報）**:
- ブログ・SNSの日常的な更新
- 過去のイベントのレポート・感想記事
- ニュースのまとめ記事

## 手順
1. get_pending_infos ツールで未判定の情報を取得してください
2. 各情報のタイトルとスニペットを読み、上記の基準で分類してください
3. classify_and_save_priority ツールで各情報の重要度を保存してください
4. 結果をまとめて報告してください

## 注意事項
- 迷ったら normal にしてください（urgentの見逃しよりnormalの過剰通知の方がダメージが小さい）
- reason は20文字以内で簡潔に
""",
    tools=[get_pending_infos, classify_and_save_priority],
    output_key="priority_results",
)

# Scout Workflow: Scout → Priority の順序実行
scout_workflow = SequentialAgent(
    name="scout_workflow",
    description="情報収集から重要度判定までの一連のワークフロー。Scout Agent が情報を収集し、Priority Agent が重要度を判定する。",
    sub_agents=[scout_agent, priority_agent],
)
