#!/usr/bin/env python3
"""Falsification test for the boundary hypothesis.

Observed across a = 4..10, coprime, 2 <= b:
    b <= 3a/4   ->  R_3 = f(a,b)   (Conjecture 1.1 holds)
    b >  3a/4   ->  R_3 < f(a,b)   (the Theorem 1.3 lower bound fails)

These points were not used to form the hypothesis. Each one predicts a verdict
before it is run; a single wrong prediction kills the rule.
"""
from math import gcd
from sweep import f
from study_scope import true_r3

CASES = [(11, 8), (13, 10), (15, 11), (14, 11), (16, 11), (17, 13), (11, 9), (13, 9)]

print(f"{'a':>3} {'b':>3} {'b/a':>5} {'3a/4':>6} {'predicted':>10} {'f(a,b)':>8} {'R_3':>8} {'actual':>10}  verdict", flush=True)
wrong = 0
for a, b in CASES:
    assert gcd(a, b) == 1
    pred = "HOLDS" if 4 * b <= 3 * a else "R_3 < f"
    r, fv = true_r3(a, b), f(a, b)
    act = "HOLDS" if r == fv else ("R_3 < f" if r < fv else "R_3 > f")
    ok = pred == act
    wrong += not ok
    print(f"{a:3} {b:3} {b/a:5.2f} {3*a/4:6.2f} {pred:>10} {fv:8} {r:8} {act:>10}  "
          f"{'as predicted' if ok else 'HYPOTHESIS REFUTED'}", flush=True)
print(f"\n{len(CASES)} out-of-sample predictions, {wrong} wrong")
