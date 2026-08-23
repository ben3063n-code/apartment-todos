#!/usr/bin/env python3
"""Where does AZB Conjecture 1.1 actually hold?

The brief quotes Conjecture 1.1 and Theorem 1.3 with no side conditions. This
determines the true R_3 over a grid and reports, per point, whether the proved
lower bound and the conjectured equality survive.

Satisfiability is monotone in n (a valid colouring of {1..n+1} restricts to one
of {1..n}), so the smallest UNSAT n is found by doubling then bisecting.
"""
import sys
from math import gcd
from sweep import sat, f


def true_r3(a, b, cap=200000):
    hi = 8
    while hi <= cap and sat(a, b, hi):
        hi *= 2
    if hi > cap:
        return None
    lo = hi // 2                      # SAT (or 4, below any Rado number)
    while lo + 1 < hi:                # invariant: lo SAT, hi UNSAT
        mid = (lo + hi) // 2
        if sat(a, b, mid):
            lo = mid
        else:
            hi = mid
    return hi


if __name__ == "__main__":
    amax, bmax = int(sys.argv[1]), int(sys.argv[2])
    print(f"{'a':>3} {'b':>3} {'gcd':>3} {'f(a,b)':>8} {'R_3':>8}  {'thm1.3':>8}  conjecture", flush=True)
    for a in range(1, amax + 1):
        for b in range(1, bmax + 1):
            r = true_r3(a, b)
            fv = f(a, b)
            if r is None:
                thm, verdict = "?", "not found"
            else:
                thm = "ok" if r >= fv else "VIOLATED"
                verdict = "HOLDS" if r == fv else ("R_3 > f" if r > fv else "R_3 < f")
            print(f"{a:3} {b:3} {gcd(a,b):3} {fv:8} {str(r):>8}  {thm:>8}  {verdict}", flush=True)
