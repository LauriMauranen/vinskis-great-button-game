#!/bin/bash

set -e

source .env

INIT_DB="$1"

rm -rf .venv

python3 -m venv .venv

. .venv/bin/activate

pip install -r requirements.txt

if [ ! -z "$INIT_DB" ]; then
	read -p "Old database will be overwritten. Are you sure you want to do it? [yes/no] " yn
	if [ "$yn" != "yes" ]; then 
		echo "You typed '$yn', exiting."
		exit 0 
	fi
	flask init-db
fi

pkill -f gunicorn
gunicorn -w 4 -D --error-logfile "$GUNICORN_ERROR_LOG" 'app:app'

cp nginx.conf /etc/nginx/

nginx -s reload
