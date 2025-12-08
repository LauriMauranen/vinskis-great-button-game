#!/bin/bash

set -o pipefail

. .venv/bin/activate

gunicorn -D --error-logfile "$1" --reload 'app:app'
