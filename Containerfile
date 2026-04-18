FROM docker.io/python:3.14.2-alpine3.23

WORKDIR /usr/src/app

COPY . .
RUN pip install -r requirements.txt 

RUN mkdir -p log/gunicorn && chmod a+rw log -R

# anna portti -b "0.0.0.0:8000"
ENTRYPOINT ["gunicorn", "--error-logfile", "log/gunicorn/error.log", "'app:app'"]
