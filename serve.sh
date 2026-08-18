#!/usr/bin/env bash
# Serve the study desk on http://127.0.0.1:8765
set -eu
cd "$(dirname "$0")"
PORT="${1:-8765}"
echo "Quant interview desk: http://127.0.0.1:${PORT}"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
