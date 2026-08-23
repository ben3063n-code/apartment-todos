#!/usr/bin/env python3
"""Sweep small (a, b) and compare the true R_3 against AZB Conjecture 1.1.

Two things are tested at once:
  * Theorem 1.3 (proved) says R_3 >= f(a,b) = a^3 + a^2 + (2b+1)a + 1.
    So n = f-1 MUST be satisfiable. If the encoder ever reports UNSAT there,
    the encoder is wrong -- this is a published-theorem test of the encoding
    across many points at once.
  * Conjecture 1.1 (open) says R_3 = f(a,b). That holds iff n = f is UNSAT.
"""
import sys
from pysat.formula import CNF
from pysat.solvers import Cadical195
from encode import encode


def sat(a, b, n):
    nv, clauses = encode(a, b, n)
    with Cadical195(bootstrap_with=clauses) as s:
        return s.solve()


def f(a, b):
    return a**3 + a**2 + (2*b + 1)*a + 1


def true_r3(a, b, cap=400000):
    """Search upward from the proved lower bound f(a,b)."""
    lo = f(a, b)
    if sat(a, b, lo - 1) is False:
        return None, "LOWER-BOUND VIOLATED"      # would contradict Theorem 1.3
    n = lo
    while n <= cap:
        if not sat(a, b, n):
            return n, "ok"
        n += 1
    return None, f">{cap}"


if __name__ == "__main__":
    amax = int(sys.argv[1]); bmax = int(sys.argv[2])
    print(f"{'a':>3} {'b':>3} {'f(a,b)':>8} {'true R_3':>9}  conjecture  thm1.3")
    for a in range(1, amax + 1):
        for b in range(1, bmax + 1):
            r, note = true_r3(a, b)
            fv = f(a, b)
            conj = "holds" if r == fv else ("FAILS" if r else note)
            thm = "ok" if note != "LOWER-BOUND VIOLATED" else "VIOLATED"
            print(f"{a:3} {b:3} {fv:8} {str(r):>9}  {conj:10}  {thm}", flush=True)
