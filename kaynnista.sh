set -o pipefail

rm -rf .venv

python3 -m venv .venv

. .venv/bin/activate

pip install -r requirements.txt

gunicorn -w 4 -D -u www-data 'app:app'

deactivate

cp nginx.conf /etc/nginx/

nginx -s reload
