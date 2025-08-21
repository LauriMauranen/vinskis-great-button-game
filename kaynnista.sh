set -o pipefail

source .env

INIT_DB="$1"

rm -rf .venv

python3 -m venv .venv

. .venv/bin/activate

pip install -r requirements.txt

# TODO promt this
if [ ! -z "$INIT_DB" ]; then
	flask init-db
	echo "Old database destroyed."	
fi

pkill -f gunicorn
gunicorn -w 4 -D -u www-data --error-logfile "$GUNICORN_ERROR_LOG" 'app:app'

cp nginx.conf /etc/nginx/

nginx -s reload
