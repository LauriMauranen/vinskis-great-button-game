set -o pipefail

UUSI="$1"

rm -rf .venv

python3 -m venv .venv

. .venv/bin/activate

pip install -r requirements.txt

if [ -z "$UUSI" ]; then
	gunicorn --reload 'app:app'
else
	flask init-db
	gunicorn -w 4 -D -u www-data 'app:app'
fi

cp nginx.conf /etc/nginx/

nginx -s reload
