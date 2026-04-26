#!/bin/bash

set -euo pipefail

podman compose run --name btn-game -d --service-ports btn-game -b "0.0.0.0:$1"
