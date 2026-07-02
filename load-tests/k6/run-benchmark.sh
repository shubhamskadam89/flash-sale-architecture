#!/bin/bash
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

set -e

echo "=========================================="
echo "Flash Sale Engine - Rate Limiter Benchmark"
echo "=========================================="
echo ""
echo "Current algorithm is read from application.properties"
echo ""
echo "Run this script THREE times:"
echo ""
echo "1. FIXED_WINDOW"
echo "2. SLIDING_WINDOW"
echo "3. TOKEN_BUCKET"
echo ""
echo "Change the algorithm before each run."
echo ""

DATE=$(date +%Y-%m-%d)
mkdir -p results
mkdir -p reports/${DATE}

ALGO=$1

if [ -z "$ALGO" ]; then
  echo "Usage:"
  echo "./run-benchmark.sh fixed-window"
  echo "./run-benchmark.sh sliding-window"
  echo "./run-benchmark.sh token-bucket"
  exit 1
fi

echo ""
echo "Running benchmark for $ALGO ..."
echo ""

GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "N/A")

set +e
k6 run \
  -e ALGO="${ALGO}" \
  -e GIT_COMMIT="${GIT_COMMIT}" \
  -e DATE="${DATE}" \
  -e HTML_REPORT_PATH="reports/${DATE}/${ALGO}.html" \
  --out json=results/${ALGO}.json \
  rate-limit-breach.js
set -e

echo ""
echo "Done."
echo ""

echo "JSON  : results/${ALGO}.json"
echo "HTML  : reports/${DATE}/${ALGO}.html"