#!/bin/bash

set -o pipefail

. .venv/bin/activate

gunicorn -w 4 -D --error-logfile "$1" --reload 'app:app'
