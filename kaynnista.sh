set -e

source .env

INIT_DB="$1"

rm -rf .venv

python3 -m venv .venv

. .venv/bin/activate

pip install -r requirements.txt

# TODO promt this
if [ ! -z "$INIT_DB" ]; then
	echo "Old database will be overwritten."	
	flask init-db
fi


pkill -f gunicorn
gunicorn -w 4 -D --error-logfile "$GUNICORN_ERROR_LOG" 'app:app'

cp nginx.conf /etc/nginx/

nginx -s reload
