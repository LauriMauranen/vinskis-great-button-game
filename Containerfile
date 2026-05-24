FROM docker.io/python:3.14.2-alpine3.23

WORKDIR /usr/src/app

COPY . .
RUN pip install -r requirements.txt 

RUN mkdir -p log/gunicorn && chmod a+rw log -R

ENTRYPOINT [ "gunicorn", "--error-logfile", "log/gunicorn/error.log", \
	"app:app", "-b", "\"0.0.0.0:$GUNICORN_PORT\""]
