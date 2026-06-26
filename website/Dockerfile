FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 9520

CMD ["gunicorn", "-w", "3", "-b", "0.0.0.0:9520", "server:app"]
