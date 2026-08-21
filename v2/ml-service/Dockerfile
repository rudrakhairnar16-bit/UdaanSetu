FROM python:3.11-slim

WORKDIR /app

RUN groupadd -r udaansetu && useradd -r -g udaansetu -d /app -s /sbin/nologin udaansetu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

RUN mkdir -p /models && chown -R udaansetu:udaansetu /app /models

USER udaansetu

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]