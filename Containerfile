FROM docker.io/python:3.14.2-alpine3.23

WORKDIR /usr/src/app

COPY . .
RUN pip install -r requirements.txt 

RUN mkdir -p log/gunicorn && chmod a+rw log -R

CMD gunicorn -b "0.0.0.0:8000" --error-logfile log/gunicorn/error.log 'app:app'
