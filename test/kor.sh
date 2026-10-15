#!/usr/bin/env bash
# Kör gränssnittstesterna mot låtsas-API:t. Kräver python3 och Playwright med Chromium.
#   bash test/kor.sh            → kör alla kontroller, skärmdumpar hamnar i test/ut/
set -u
cd "$(dirname "$0")/.."
UI="$PWD/ui"
UT="$PWD/test/ut"
mkdir -p "$UT"
rm -f "$UT"/*.jsonl
python3 test/mock_api.py "$UI" 8601 static   "$UT/logg-static.jsonl" & P1=$!
python3 test/mock_api.py "$UI" 8611 full     "$UT/logg.jsonl"        & P2=$!
python3 test/mock_api.py "$UI" 8612 nere     "$UT/logg-nere.jsonl"   & P3=$!
python3 test/mock_api.py "$UI" 8613 bemannat "$UT/logg-bem.jsonl"    & P4=$!
trap 'kill $P1 $P2 $P3 $P4 2>/dev/null' EXIT
sleep 1.5
python3 test/ui_test.py "$UT" "$UT/logg.jsonl"
