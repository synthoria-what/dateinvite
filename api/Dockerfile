FROM python:3.12-slim

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

EXPOSE 1112

CMD ["uvicorn", "main:app", "--port", "1112", "--host", "0.0.0.0"]