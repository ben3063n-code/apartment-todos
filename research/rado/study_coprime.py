#!/usr/bin/env python3
"""Coprime points only -- where does the proved lower bound of Theorem 1.3 hold?"""
import sys
from math import gcd
from sweep import f
from study_scope import true_r3

if __name__ == "__main__":
    lo, hi = int(sys.argv[1]), int(sys.argv[2])
    print(f"{'a':>3} {'b':>3} {'b/a':>5} {'f(a,b)':>8} {'R_3':>8}  {'thm1.3':>8}  conjecture", flush=True)
    for a in range(lo, hi + 1):
        for b in range(1, a + 3):
            if gcd(a, b) != 1:
                continue
            r = true_r3(a, b)
            fv = f(a, b)
            thm = "ok" if r >= fv else "VIOLATED"
            verdict = "HOLDS" if r == fv else ("R_3 > f" if r > fv else "R_3 < f")
            print(f"{a:3} {b:3} {b/a:5.2f} {fv:8} {r:8}  {thm:>8}  {verdict}", flush=True)
