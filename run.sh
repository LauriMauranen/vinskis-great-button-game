#!/bin/bash

set -oeu pipefail

ERR_LOG="$1"

if [[ -z "$ERR_LOG" ]]; then
	echo "Virhelokin polku puuttuu!"
	exit 1
fi

. .venv/bin/activate

gunicorn -D --error-logfile "$ERR_LOG" --reload 'app:app'
