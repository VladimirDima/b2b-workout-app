#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-4001}"
STARTED_SERVER=0
SERVER_PID=""

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared is not installed."
  echo "Install it with: brew install cloudflared"
  exit 1
fi

cleanup() {
  if [[ "$STARTED_SERVER" == "1" && -n "$SERVER_PID" ]]; then
    echo ""
    echo "Shutting down server..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

if curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
  echo "Server already running on port ${PORT} — reusing it."
else
  echo "Building app..."
  npm run build

  echo ""
  echo "Starting server on port ${PORT}..."
  node server/index.js &
  SERVER_PID=$!
  STARTED_SERVER=1

  for _ in {1..20}; do
    if curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
      break
    fi
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "Server failed to start. Is port ${PORT} already in use?"
      exit 1
    fi
    sleep 0.25
  done

  if ! curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    echo "Server did not become ready on port ${PORT}."
    exit 1
  fi
fi

echo ""
echo "Opening Cloudflare tunnel (HTTPS → localhost:${PORT})..."
echo "Look for a line like:  https://something-random.trycloudflare.com"
echo "Open that URL on your phone. Press Ctrl+C to stop the tunnel."
if [[ "$STARTED_SERVER" == "1" ]]; then
  echo "Stopping the tunnel also stops the server started by this script."
fi
echo ""

cloudflared tunnel --url "http://127.0.0.1:${PORT}"
