FROM python:3.11-slim

WORKDIR /app

# 依存パッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY app ./app

# Cloud Run は PORT 環境変数でポートを指定
EXPOSE 8080

# Uvicornでアプリケーションを起動（Cloud Runの$PORTを使用）
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
