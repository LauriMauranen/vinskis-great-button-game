FROM docker.io/python:3.14.2-alpine3.23

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD gunicorn -D --error-logfile /var/log/gunicorn/error.log 'app:app'
