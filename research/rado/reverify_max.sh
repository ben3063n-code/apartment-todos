#!/bin/bash
# Last attempt at the four largest proofs: push heap as far as 15 GB RAM allows.
# These failed with 'heap space exhausted' at 10500/3500 and 9000/5000, so
# shift the split toward heap while keeping stack above the 3500 that worked.
cd /home/user/apartment-todos/research/rado
for p in "$@"; do
  set -- $p; a=$1; b=$2; n=$3
  echo "### ($a,$b) n=$n  $(date -u +%H:%M:%S)"
  python3 encode.py $a $b $n -o /tmp/mx.cnf 2>/dev/null
  ./bin/cadical /tmp/mx.cnf /tmp/mx.drat > /dev/null 2>&1
  ./bin/drat-trim /tmp/mx.cnf /tmp/mx.drat -L /tmp/mx.lrat 2>&1 | grep -E "^s " | sed 's/^/  drat-trim: /'
  echo "  lrat $(du -h /tmp/mx.lrat | cut -f1)"
  for hs in "11500 3000" "12500 2200"; do
    set -- $hs
    out=$(timeout 5400 ./bin/cake_lpr --CML_HEAP_SIZE=$1 --CML_STACK_SIZE=$2 /tmp/mx.cnf /tmp/mx.lrat 2>&1 | tail -1)
    echo "  heap=${1}MB stack=${2}MB -> $out"
    [[ "$out" == *"VERIFIED UNSAT"* ]] && break
  done
  rm -f /tmp/mx.cnf /tmp/mx.drat /tmp/mx.lrat
done
echo "### done $(date -u +%H:%M:%S)"
