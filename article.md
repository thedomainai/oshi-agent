---
title: "推し活の「見逃し」を減らしたい。6体のAIエージェントが自律稼働する「オシエージェント」"
emoji: "🎤"
type: "idea"
topics: ["gch4", "gemini", "googlecloud", "adk", "nextjs"]
published: true
---

## はじめに

**第4回 Agentic AI Hackathon with Google Cloud** への参加作品として、**オシエージェント**を開発しました。

> **チケット先行の見逃し、限定グッズの売り切れ――推し活で最も痛い「見逃し」を減らすAIマネージャー。**

推しを登録するだけで、**6体のAIエージェントが自律的に稼働**。Web上の公開情報から推しに関する最新情報を自動収集し、重要度を判定してアラート通知。さらにカレンダー登録・遠征計画・予算管理まで自動化します。

**プロジェクトURL**

- デモサイト: https://oshi-agent-frontend-544358958632.asia-northeast1.run.app
- GitHubリポジトリ: https://github.com/yuta-nakabayashi/oshi-agent

## デモ動画

https://www.youtube.com/watch?v=XXXXX

## 課題の新規性: なぜ「推し活」に Agentic AI が必要なのか

### 推し活市場の現状

推し活人口は**約1,384万人**（前年比+250万人で急増中）、市場規模は**約3兆5,000億円**に達しています。1人あたりの年間支出は平均**約25万5,000円**です。

しかし、多くのファンが本当に困っているのは「情報が多すぎる」ことではありません。**見逃したら取り返しがつかない情報を確実にキャッチできない**ことです。

### 真のペイン: 痛みの強度で分類

| レベル | 困りごと | 具体例 | 影響 |
|--------|---------|--------|------|
| **S級（取り返しがつかない）** | チケット先行・抽選の見逃し | FC先行の締切を知らなかった | ライブに参加できない。転売価格は2〜10倍 |
| **S級** | 限定グッズの売り切れ | 気づいたときには完売 | 再販の保証なし |
| **A級（金銭・時間の損失）** | 遠征計画の非効率 | 毎回ゼロから交通・宿泊を調査 | 1回あたり2〜3時間の浪費 |
| **A級** | 予算超過の無自覚 | 月末に「こんなに使ってたの？」 | 家計への打撃 |
| **B級（不便だが致命的ではない）** | 日常的な情報の見逃し | ブログ更新、SNS投稿 | 見逃しても致命的ではない |

**核心的洞察**: 多くのファン向けツールは B級の課題（情報の効率化）に注力していますが、ユーザーが最も苦しんでいるのは **S級の課題（見逃したら二度と戻らない機会）** です。

### 既存ツールでは解決できない理由

| 既存ツール | 限界 |
|-----------|------|
| Google Alert | キーワードマッチのみ。「チケット先行が始まった」という文脈を理解できない |
| カレンダーアプリ | 手動登録が前提。そもそも情報に気づかなければ登録できない |
| SNSの通知 | 全投稿に通知が来るか、通知なし。重要度判定ができない |

これらのツールは全て**受動的**です。情報を集め、判断し、行動するのは全て人間。ここに Agentic AI の出番があります。

### なぜ Agentic AI なのか

オシエージェントが解決する課題は、Agentic AI の本質と完全に一致しています。

- **自律性**: ユーザーの介入なしで24時間情報を収集し続ける
- **判断力**: 収集した情報をAIが**ファン目線で重要度判定**（チケット/限定品は自動的に「緊急」に分類）
- **行動力**: 重要情報をアラートとして即座に表示し、カレンダー登録・遠征プラン生成まで実行する

「情報を集めるだけ」ではなく、**集めて、判断して、アラートして、行動する**。この一連のフローを完全自律で回すことが、既存ツールとの決定的な差別化ポイントです。

## 解決策の有効性: 6体のマルチエージェントによる推し活の自律管理

### ソリューション概要

オシエージェントのコアバリューは **「推し活の見逃しリスクを最小化する」** ことです。推しを登録するだけで、6体のAIエージェントが以下のタスクを自動化します。

```
【ユーザーがやること】             【AIが自律的にやること】

  推しの名前を登録する ───→  1. 情報収集 (Scout Agent)
                               2. 重要度判定 (Priority Agent)
         ↓                     3. 初回サマリー自動生成 (Gemini)
                               4. カレンダー登録 (Calendar Agent)
  アラートを確認する ←────── 5. 遠征プラン生成 (Trip Agent)
                               6. 予算管理 (Budget Agent)
```

ユーザーの作業は**「推しを登録する」と「アラートを確認する」だけ**です。

### なぜマルチエージェントなのか

単一のLLMに全てを任せるアプローチでは、タスクが複雑になるほど精度が低下します。マルチエージェント設計を採用した理由は3つあります。

**1. 専門性による精度向上**

各エージェントは1つの責務に集中します。Scout Agent は「情報を集めること」だけ、Priority Agent は「重要度を判定すること」だけに特化しています。プロンプトも役割に最適化できるため、汎用プロンプトと比べて判定精度が向上します。

**2. 障害の局所化**

例えば Google Maps API が一時的に利用できなくても、Trip Agent だけが影響を受け、情報収集（Scout）や重要度判定（Priority）は正常に継続します。

**3. 拡張性**

新しい機能を追加する場合、既存のエージェントに手を加える必要はありません。例えば「グッズ在庫監視」が欲しければ、Goods Agent を追加して Root Agent に登録するだけです。

### ユーザー体験フロー

```
Step 1: 推しを登録（例: アーティスト名を入力）
      ↓
Step 2: AIが即座に情報収集を開始し、初回サマリーを自動生成
   「◯◯さんの最近の活動: 3月に全国ツアー開催決定！
    ファンクラブ先行受付が開始されています。」
      ↓
Step 3: ダッシュボードにアラートが表示
   🔴 緊急アラート「ファンクラブ先行チケット受付中！ 締切: 明後日18:00」
   🟡 注目情報「新アルバム発売日決定: 4月23日」
      ↓
Step 4: 「詳細を見る」→ タイムラインで全情報を確認
   日常の情報も含めて時系列で一覧表示
      ↓
Step 5: イベントをGoogleカレンダーに登録
      ↓
Step 6: ライブの遠征プランを自動生成
   「新幹線 大阪→東京 13:00発、宿泊: 水道橋 ¥8,000、推定費用: ¥48,000」
      ↓
Step 7: 月次レポート
   「今月の推し活支出: ¥35,000（予算の87%）」
```

**ポイント**: ダッシュボードを開くだけで、Web上の公開情報から見つかった重要情報が一目でわかります。毎日使わなくても、**入れておくだけで安心**な保険型の価値を提供します。

### 課題解決の効果と限界

| 指標 | Before | After | 備考 |
|------|--------|-------|------|
| Web公開情報の巡回 | 手動で毎日確認 | AIが自動収集・分類 | Google Custom Search 経由の公開情報が対象 |
| 重要情報の見落とし | 各サイトを個別に確認 | 重要度判定で自動アラート | FC限定情報など非公開情報は対象外 |
| 遠征計画 | 毎回ゼロから調査 | Maps API + Gemini で自動生成 | 概算ベース。実際の予約は手動 |

**現時点の限界**: 情報源は Google Custom Search で取得可能な**Web上の公開情報に限定**されます。ファンクラブ限定情報、SNSのリアルタイム投稿、EC サイトの在庫情報などは取得できません。今後、Twitter API・YouTube Data API 等の連携で情報源を拡大予定です。

## システムアーキテクチャ

### 全体構成

```
┌──────────────────────────────────────────────────────────┐
│                      ユーザー（ブラウザ）                    │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼─────────────────────────────────┐
│              Next.js 15 + React 19                        │
│              Cloud Run (Frontend)                         │
│                                                           │
│  ・Server Components でデータフェッチ                       │
│  ・NextAuth v5 で Google OAuth 認証                        │
│  ・BFF パターンで Backend と内部通信                         │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP + X-Internal-Api-Key
┌────────────────────────▼─────────────────────────────────┐
│              Python FastAPI + ADK + Gemini                   │
│              Cloud Run (Backend)                           │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │          Root Agent（オーケストレーター）               │ │
│  │  ワークフロー制御 / エラーハンドリング / ログ管理        │ │
│  └────┬────────┬────────┬────────┬────────┬────────────┘ │
│       │        │        │        │        │              │
│  ┌────▼──┐┌────▼──┐┌────▼──┐┌────▼──┐┌────▼──┐          │
│  │Scout  ││Prior- ││Calen- ││Trip   ││Budget │          │
│  │Agent  ││ity   ││dar   ││Agent  ││Agent  │          │
│  │       ││Agent  ││Agent  ││       ││       │          │
│  │情報   ││重要度 ││予定   ││遠征   ││予算   │          │
│  │収集   ││判定   ││管理   ││計画   ││管理   │          │
│  └───┬───┘└───┬───┘└───┬───┘└──┬┬───┘└───┬───┘          │
│      │        │        │       ││        │              │
└──────┼────────┼────────┼───────┼┼────────┼──────────────┘
       │        │        │       ││        │
  ┌────▼────┐┌──▼─────┐┌▼──────┐│▼────┐┌──▼─────┐
  │Google   ││Gemini  ││Google ││Maps ││Gemini  │
  │Custom   ││2.0     ││Calen- ││API  ││2.0     │
  │Search   ││Flash   ││dar API││     ││Flash   │
  └─────────┘└────────┘└───────┘└─────┘└────────┘

       ▲ 1時間ごとに自動実行
  ┌────┴──────┐      ┌──────────────┐
  │ Cloud     │      │  Firestore   │
  │ Scheduler │      │  (NoSQL DB)  │
  └───────────┘      └──────────────┘
```

### 技術スタック

| レイヤー | 技術 | 選定理由 |
|---------|------|----------|
| **Frontend** | Next.js 15 (App Router) + React 19 | Server Components によるパフォーマンス最適化 |
| **UI** | Tailwind CSS + shadcn/ui | アクセシブルで高速な UI 開発 |
| **認証** | NextAuth v5 + Google OAuth 2.0 | Google アカウントでワンクリックログイン |
| **Backend** | Python 3.11 + FastAPI | AI処理に最適な言語 |
| **エージェント** | ADK (Agent Development Kit) | Scout→Priority ワークフローを LlmAgent + SequentialAgent で実装 |
| **AI** | Gemini 2.0 Flash | 高速・低コスト、長文理解と分類精度に優れる |
| **DB** | Firestore | NoSQL、スキーマ柔軟、Cloud Run との親和性 |
| **定期実行** | Cloud Scheduler | Scout Agent の24時間自律巡回を実現 |
| **API** | Custom Search / Calendar / Maps | 情報収集・予定管理・ルート計算 |
| **デプロイ** | Cloud Run (2コンテナ) | 自動スケーリング、従量課金 |

### BFF パターンの採用

Frontend と Backend の間に **BFF（Backend for Frontend）パターン** を採用しました。

```
ブラウザ → Next.js API Routes（BFF）→ Python Backend
```

- **セキュリティ**: API キーや内部通信の認証情報をクライアントに露出しない
- **型安全性**: TypeScript で API レスポンスの型を保証
- **柔軟性**: Frontend の要件に合わせたデータ変換を BFF 層で実施

## マルチエージェント詳細設計

### エージェント一覧

| エージェント | 責務 | 使用 API | 実行トリガー |
|------------|------|---------|------------|
| **Root Agent** | ワークフロー全体の制御 | - | 他エージェントから委譲 |
| **Scout Agent** | 推しの最新情報を Web から収集 | Google Custom Search | Cloud Scheduler（1時間ごと） |
| **Priority Agent** | 収集情報の重要度を3段階で判定 | Gemini 2.0 Flash | Scout 完了後に自動実行 |
| **Calendar Agent** | イベント情報を Google Calendar に登録 | Google Calendar API | ユーザー操作 |
| **Trip Agent** | 遠征の交通・宿泊プランを生成 | Google Maps API + Gemini | ユーザー操作 |
| **Budget Agent** | 月次の支出分析とアドバイス生成 | Gemini 2.0 Flash | ユーザー操作 |

### Root Agent: オーケストレーター

Root Agent は全エージェントの司令塔です。ワークフローの実行順序を管理し、エージェント間の依存関係を制御します。

```python
class RootAgent:
    """全エージェントを統括するオーケストレーター"""

    async def run_scout_and_summarize(self, oshi_id: str) -> dict:
        # 1. Scout Agent: 情報収集
        scout_result = await self.run_scout_workflow(oshi_id)

        # 2. 収集情報からサマリーを生成（初回登録時の体験向上）
        oshi = self.oshi_repo.get_by_id(oshi_id)
        infos = self.info_repo.get_all_by_oshi(oshi_id)
        summary = self.gemini_client.generate_oshi_summary(
            oshi_name=oshi.name, infos=infos[:10]
        )

        return {**scout_result, "summary": summary}

    async def run_scout_workflow(self, oshi_id: str) -> dict:
        oshi = self.oshi_repo.get_by_id(oshi_id)

        # Scout Agent: 情報収集
        new_info_ids = await self.scout_agent.collect_info(
            oshi_id=oshi.id, oshi_name=oshi.name,
            official_url=oshi.official_url,
        )

        # Priority Agent: 重要度判定（新規情報がある場合のみ）
        priority_results = {}
        if new_info_ids:
            priority_results = await self.priority_agent.judge_priority(
                new_info_ids
            )

        return {"oshi_id": oshi_id,
                "collected_count": len(new_info_ids),
                "priority_results": priority_results}
```

**設計のポイント**:
- Scout → Priority の順序制御を Root Agent が担う
- **推し登録直後にサマリーを自動生成**し、初回の「Wow体験」を演出
- Priority は新規情報がある場合のみ実行（無駄な API コール削減）
- 各エージェントが失敗しても、他のエージェントへの影響を局所化

### ADK によるワークフロー実装

Scout → Priority の情報収集ワークフローは、**ADK (Agent Development Kit)** の `LlmAgent` + `SequentialAgent` でも実装しています。従来の手動オーケストレーションに加え、**LLM が自律的にツールを選択・実行するパターン**を提供しています。

```python
from google.adk.agents import LlmAgent, SequentialAgent

# Scout Agent: LLM が search/save ツールを自律的に使い分ける
scout_agent = LlmAgent(
    name="scout_agent",
    model="gemini-2.0-flash",
    instruction="""推しの最新情報をWebから検索し、
    見つかった情報をデータベースに保存してください。""",
    tools=[search_oshi_info, save_info],
    output_key="scout_results",
)

# Priority Agent: LLM がファン目線で重要度を判定する
priority_agent = LlmAgent(
    name="priority_agent",
    model="gemini-2.0-flash",
    instruction="""未判定の情報を取得し、
    見逃した場合のダメージに基づいて重要度を分類してください。""",
    tools=[get_pending_infos, classify_and_save_priority],
    output_key="priority_results",
)

# SequentialAgent で Scout → Priority を直列実行
scout_workflow = SequentialAgent(
    name="scout_workflow",
    sub_agents=[scout_agent, priority_agent],
)
```

**ADK 版と従来版の違い**:
- **従来版**: Root Agent が明示的に「検索 → 保存 → 判定」の手順を呼び出す（決定論的）
- **ADK 版**: LLM がツール一覧と instruction から最適な実行計画を自律的に組み立てる（エージェンティック）
- 現時点では両方のエンドポイント (`/agent/scout`, `/agent/scout-adk`) を提供し、比較検証が可能です

### Scout Agent: 情報の自律収集

Scout Agent は推しの最新情報を Google Custom Search API で定期的に収集します。**Cloud Scheduler で1時間ごとに自動実行**されるため、ユーザーの操作は不要です。

```python
class ScoutAgent:
    """推しの情報を自律的に収集するエージェント"""

    async def collect_info(self, oshi_id: str, oshi_name: str,
                           official_url: str = None) -> list[str]:
        # 検索クエリを構築
        query = f"{oshi_name} 最新情報"
        if official_url:
            query += f" OR site:{official_url}"

        # Google 検索を実行
        search_results = self.search_client.search(query, num_results=10)

        new_info_ids = []
        for result in search_results:
            # URL 重複チェック
            if self.info_repo.find_by_url(oshi_id, result["link"]):
                continue

            # 新規情報として保存
            info = self.info_repo.create(CollectedInfoCreate(
                title=result["title"],
                url=result["link"],
                snippet=result.get("snippet"),
                oshi_id=oshi_id,
            ))
            new_info_ids.append(info.id)

        return new_info_ids
```

**設計のポイント**:
- URL 単位の重複排除で、同じ情報を二重に保存しない
- 公式 URL が登録されている場合、`site:` 演算子で公式情報を優先取得
- `tenacity` ライブラリによる Exponential Backoff でAPI制限に対応

### Priority Agent: ファン目線の重要度判定

Priority Agent は Gemini 2.0 Flash を使い、収集した情報を**見逃した場合のダメージ**に基づいて **urgent / important / normal** の3段階に分類します。

```python
# ファン目線の重要度判定プロンプト
prompt = f"""あなたは推し活（ファン活動）の情報を分析する専門家です。
以下の情報の重要度を、ファンの視点で判定してください。

タイトル: {title}
URL: {url}
概要: {snippet}

## 判定基準（見逃した場合のダメージで分類）

**urgent（見逃すと取り返しがつかない）**:
- チケットの先行販売・一般販売の開始や申込期限
- 限定グッズ・限定商品の発売開始
- ファンクラブの入会・更新期限
- 期間限定のキャンペーン・コラボ

**important（知っておくべき重要情報）**:
- 新イベント・ライブ・コンサートの告知
- 新曲・アルバム・DVD/Blu-rayの発売情報
- テレビ・ラジオ・雑誌への出演情報

**normal（日常的な情報）**:
- ブログ・SNSの日常的な更新
- 過去のイベントのレポート・感想記事

JSON形式で回答: {{"priority": "urgent|important|normal", "reason": "判定理由"}}
"""
```

**設計のポイント**:
- **「見逃した場合のダメージ」** でプロンプトを設計。「重要かどうか」ではなく「見逃したらどうなるか」という基準がファンの感覚と一致する
- タイトル + URL に加え、**スニペット（概要）** も渡すことで判定精度を向上
- API エラー時は `normal` にフォールバック（情報を失わない安全設計）

### Trip Agent: 遠征プラン自動生成

Trip Agent は **Google Maps API** でルートを計算し、**Gemini** でアドバイスを生成します。

```python
class TripAgent:
    async def generate_plan(self, event_id, user_id, departure):
        event = self.event_repo.get_by_id(event_id)

        # Google Maps API でルート計算
        directions = self.maps_client.get_directions(
            departure, event.location
        )

        # 距離に応じた宿泊判定
        distance_km = directions["distance_meters"] / 1000.0
        needs_hotel = distance_km > 100

        # Gemini で遠征アドバイスを生成
        advice = self.gemini_client.generate_trip_advice(
            departure=departure,
            destination=event.location,
            event_date=event.start_datetime.isoformat(),
        )

        # プランを保存
        return self.trip_repo.create(user_id, TripPlanCreate(
            event_id=event_id,
            transport=TransportInfo(distance_km=distance_km, ...),
            accommodation=AccommodationInfo(nights=1 if needs_hotel else 0, ...),
            advice=advice,
        ))
```

### Budget Agent: 予算管理

Budget Agent は月次の支出を集計し、Gemini でカテゴリ別の傾向分析とアドバイスを生成します。

```python
class BudgetAgent:
    async def generate_report(self, user_id, year, month):
        expenses = self.expense_repo.get_by_month(user_id, year, month)

        # カテゴリ別集計
        by_category = {}
        for expense in expenses:
            by_category[expense.category] = (
                by_category.get(expense.category, 0) + expense.amount
            )

        # Gemini でアドバイス生成
        advice = self.gemini_client.generate_budget_advice(
            expenses=[{"category": e.category, "amount": e.amount}
                      for e in expenses]
        )

        return {"total": sum(by_category.values()),
                "by_category": by_category, "advice": advice}
```

## 実装品質と拡張性

### 実装の完成度

| 項目 | 内容 |
|------|------|
| **エージェント** | 6体全て実装済み、Cloud Run 上で稼働中 |
| **フロントエンド** | 20ルート（ダッシュボード含む）、Server/Client Components 適切に分離 |
| **ダッシュボード** | 重要アラートバナー（緊急/注目）、統計カード、最新情報表示 |
| **バックエンド** | FastAPI + ADK (LlmAgent / SequentialAgent)、Pydantic v2 によるバリデーション |
| **エラーハンドリング** | tenacity によるリトライ、フォールバック設計 |
| **ログ** | structlog による構造化ログ、Cloud Logging 連携 |
| **セキュリティ** | BFF 内部認証、推し所有者検証、CORS 制限 |

### Google Cloud ツールの活用

本プロジェクトでは、Google Cloud のサービスを**7つ**活用しています。

```
┌─ AI ─────────────────────────────────────┐
│  Gemini 2.0 Flash: 重要度判定、プラン生成、  │
│                    予算分析、イベント抽出    │
└──────────────────────────────────────────┘
┌─ Compute ────────────────────────────────┐
│  Cloud Run: Frontend + Backend 2コンテナ   │
│  Cloud Scheduler: 定期実行（1時間ごと）     │
└──────────────────────────────────────────┘
┌─ Data ───────────────────────────────────┐
│  Firestore: ユーザー・推し・収集情報・       │
│             イベント・遠征・支出データ       │
└──────────────────────────────────────────┘
┌─ API ────────────────────────────────────┐
│  Google Custom Search: Web 情報収集        │
│  Google Calendar API: カレンダー自動登録    │
│  Google Maps API: ルート計算・距離算出      │
└──────────────────────────────────────────┘
```

### 拡張性の設計

**エージェント追加の容易さ**

マルチエージェント設計により、新機能は新エージェントとして独立実装できます。

```
現在: Root → Scout → Priority → Calendar → Trip → Budget
               ↓ 追加例
将来: Root → Scout → Priority → Calendar → Trip → Budget
              ↓
         Goods Agent (グッズ在庫監視)
         SNS Agent (Twitter/Instagram 直接連携)
         Notification Agent (プッシュ通知)
```

既存コードへの変更は **Root Agent のルーティング追加のみ** です。

**スケーラビリティ**

| 観点 | 設計 |
|------|------|
| **同時ユーザー増** | Cloud Run の自動スケーリング（0〜10インスタンス） |
| **データ増** | Firestore の水平スケーリング（インデックス最適化済み） |
| **API 制限** | キャッシュ活用、Exponential Backoff、実行頻度の動的調整 |

### 費用対効果

| 項目 | 月額（1,000ユーザー想定） |
|------|----------------------|
| Cloud Run | 約 ¥3,000（min=0でアイドル時ゼロ） |
| Firestore | 約 ¥1,000 |
| Google APIs | 約 ¥1,000 |
| **合計** | **約 ¥5,000**（1ユーザーあたり約 ¥5） |

### コード品質

- **TypeScript strict mode**: フロントエンド全ファイルで型安全性を保証
- **Pydantic v2**: バックエンドの入出力バリデーション
- **構造化ログ**: `structlog` で JSON 形式のログを Cloud Logging に連携
- **テスト**: フロントエンドのユーティリティ関数に対するユニットテストを実装

## 技術的チャレンジと学び

### 直面した課題と解決策

**課題1: Gemini の回答フォーマットの不安定さ**

JSON 形式を指定しても、` ```json ` ブロックで返ってくることがありました。パース前にクリーニング処理を追加し、安定した構造化データ取得を実現しました。

```python
# JSONパースの安定化
if result_text.startswith("```json"):
    result_text = result_text[7:]
if result_text.endswith("```"):
    result_text = result_text[:-3]
result_text = result_text.strip()
```

**課題2: Cloud Run でのリバースプロキシ対応**

Cloud Run はコンテナの前段にリバースプロキシを配置するため、NextAuth の URL 解決で内部ホスト名（`0.0.0.0:3000`）が使われる問題がありました。`trustHost: true` の設定と、`NEXTAUTH_URL` ベースの明示的なリダイレクトで解決しました。

**課題3: マルチエージェント間のエラー伝播**

1つのエージェントの失敗が全体のワークフローを止めてしまう問題。Root Agent でエージェントごとの try-catch を実装し、障害を局所化しました。

### ハッカソンでの学び

- **ADK の活用**: Scout Agent と Priority Agent を `LlmAgent` として定義し、`SequentialAgent` で直列実行するワークフローを構築しました。ツール関数を plain function で渡すだけでエージェントが自律的にツールを使い分けてくれるため、従来の手動オーケストレーションよりもシンプルになりました
- **Gemini の汎用性**: 分類・抽出・生成を全て1つの API で実現できる点が強力でした
- **Cloud Run の手軽さ**: Dockerfile があればすぐにデプロイでき、ローカル開発とのギャップが最小限でした

## 今後の展望

### 短期（3ヶ月）

- Twitter API・YouTube Data API の連携で情報源を拡大
- ユーザーフィードバック（「この情報は重要」）による重要度判定のパーソナライズ
- プッシュ通知の実装

### 中期（6ヶ月）

- Goods Agent: EC サイトのグッズ在庫監視・再入荷通知
- コミュニティ機能: 同じ推しのユーザー同士での情報共有
- 遠征プランのシェア機能

### 長期（1年）

- 音声対話インターフェース:「明日の推しの予定教えて」で回答
- 海外推し対応: K-POP 等の多言語化
- B2B API 提供: 他の推し活アプリへのエージェント API 提供

## おわりに

オシエージェントは、**「AIエージェントが人間の代わりに24時間働く」** という Agentic AI の本質を、推し活という身近な課題で体現したプロジェクトです。

6体のエージェントがそれぞれの専門性を持ち、協調して動くことで、**情報収集→重要度判定→アラート→行動**の一連のフローを自律化しました。ユーザーがやることは「推しの名前を登録する」だけ。あとはAIがWeb上の公開情報を見張り続けてくれます。

現時点では情報源がGoogle Custom Searchに限定されるという制約がありますが、Twitter API・YouTube Data API等の連携により情報源を拡大することで、**推し活の見逃しリスクをさらに低減**できると考えています。オシエージェントは、推し活の不安を安心に変え、**推しを応援する喜びに集中できる世界**を目指しています。

## リンク

- **GitHubリポジトリ**: https://github.com/yuta-nakabayashi/oshi-agent
- **デモサイト**: https://oshi-agent-frontend-544358958632.asia-northeast1.run.app
- **ハッカソン**: https://zenn.dev/hackathons/google-cloud-japan-ai-hackathon-vol4
