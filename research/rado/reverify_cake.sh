#!/bin/bash
# Re-verify UNSAT proofs with cake_lpr, escalating heap until it fits.
cd /home/user/apartment-todos/research/rado
for p in "27 16 21304" "27 17 21358" "28 17 23717" "29 3 25434" "29 16 26188" "29 17 26246" "29 18 26304"; do
  set -- $p; a=$1; b=$2; n=$3
  echo "### ($a,$b) n=$n  $(date -u +%H:%M:%S)"
  python3 encode.py $a $b $n -o /tmp/rv.cnf 2>/dev/null
  ./bin/cadical /tmp/rv.cnf /tmp/rv.drat > /dev/null 2>&1
  ./bin/drat-trim /tmp/rv.cnf /tmp/rv.drat -L /tmp/rv.lrat 2>&1 | grep -E "^s " | sed 's/^/  drat-trim: /'
  echo "  lrat $(du -h /tmp/rv.lrat | cut -f1)"
  for heap in 11000 13000; do
    out=$(timeout 3600 ./bin/cake_lpr --CML_HEAP_SIZE=$heap --CML_STACK_SIZE=1000 /tmp/rv.cnf /tmp/rv.lrat 2>&1 | tail -1)
    echo "  heap=${heap}MB -> $out"
    [[ "$out" == *"VERIFIED UNSAT"* ]] && break
  done
  rm -f /tmp/rv.cnf /tmp/rv.drat /tmp/rv.lrat
done
echo "### reverify done $(date -u +%H:%M:%S)"
