set -e

rm -r .venv

python -m venv .venv

. .venv/bin/activate

pip install -r requirements.txt

gunicorn -w 4 -D -u www-data 'app:app'
