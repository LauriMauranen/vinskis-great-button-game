FROM docker.io/python:3.14.2-alpine3.23

RUN mkdir /app
WORKDIR /app

COPY requirements.txt .
COPY app/ .

RUN python -m venv .venv
RUN . .venv/bin/activate
RUN pip install -r requirements.txt

ARG errorLog
CMD gunicorn -D --error-logfile $errorLog --reload 'app:app'
