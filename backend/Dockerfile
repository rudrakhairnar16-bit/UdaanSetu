FROM python:3.12-slim

RUN groupadd -r udaansetu && useradd -r -g udaansetu -d /app -s /sbin/nologin udaansetu

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
RUN mkdir -p /app/data /app/uploads && chown -R udaansetu:udaansetu /app

USER udaansetu

EXPOSE 8000

CMD ["sh", "-c", "python -c 'from app.seed import seed; seed()' && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
