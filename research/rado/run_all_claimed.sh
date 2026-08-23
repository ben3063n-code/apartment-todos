#!/bin/bash
# Determine every claimed point, both polarities, full verification chain.
cd /home/user/apartment-todos/research/rado
for p in "25 16 17076" "27 16 21304" "27 17 21358" "28 17 23717" "29 16 26188" "29 17 26246" "29 18 26304" "29 3 25434"; do
  set -- $p; a=$1; b=$2; r=$3
  echo "### ($a,$b) claimed R_3 = $r  ($(date -u +%H:%M:%S))"
  python3 -u run.py $a $b $((r-1)) $r --timeout 7200 || echo "!!! FAILED ($a,$b)"
done
echo "### all done ($(date -u +%H:%M:%S))"
