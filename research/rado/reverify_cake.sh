#!/bin/bash
# Re-verify UNSAT proofs with cake_lpr.
#
# cake_lpr needs both a large heap AND a large stack, sized against the LRAT
# proof. (25,16) at 148 MB clears heap=8192/stack=2048. The box has 15 GB and
# no swap, so heap+stack must stay under ~14 GB; the largest proofs here
# (315 MB) may simply not fit.
cd /home/user/apartment-todos/research/rado
for p in "$@"; do
  set -- $p; a=$1; b=$2; n=$3
  echo "### ($a,$b) n=$n  $(date -u +%H:%M:%S)"
  python3 encode.py $a $b $n -o /tmp/rv.cnf 2>/dev/null
  ./bin/cadical /tmp/rv.cnf /tmp/rv.drat > /dev/null 2>&1
  ./bin/drat-trim /tmp/rv.cnf /tmp/rv.drat -L /tmp/rv.lrat 2>&1 | grep -E "^s " | sed 's/^/  drat-trim: /'
  echo "  lrat $(du -h /tmp/rv.lrat | cut -f1)"
  for hs in "10500 3500" "9000 5000"; do
    set -- $hs
    out=$(timeout 5400 ./bin/cake_lpr --CML_HEAP_SIZE=$1 --CML_STACK_SIZE=$2 /tmp/rv.cnf /tmp/rv.lrat 2>&1 | tail -1)
    echo "  heap=${1}MB stack=${2}MB -> $out"
    [[ "$out" == *"VERIFIED UNSAT"* ]] && break
  done
  rm -f /tmp/rv.cnf /tmp/rv.drat /tmp/rv.lrat
done
echo "### done $(date -u +%H:%M:%S)"
