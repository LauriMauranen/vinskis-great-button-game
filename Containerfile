FROM docker.io/python:3.14.2-alpine3.23

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ .

ARG errorLog
CMD gunicorn -D --error-logfile $errorLog --reload 'app:app'
