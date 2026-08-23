#!/usr/bin/env python3
"""Cross-check encoder A against the independently written encoder B.

Compares the two CNFs as multisets of normalised clauses, so clause order and
literal order inside a clause do not matter -- only the logical content does.
"""
import subprocess, sys, tempfile, os
from collections import Counter
from encode import encode


def read_dimacs(path):
    header, clauses = None, []
    with open(path) as f:
        for line in f:
            if line.startswith("c"):
                continue
            if line.startswith("p"):
                header = tuple(line.split()[2:4])
                continue
            lits = [int(t) for t in line.split()][:-1]
            if lits:
                clauses.append(tuple(sorted(set(lits))))
    return header, Counter(clauses)


def compare(a, b, n):
    with tempfile.TemporaryDirectory() as d:
        pb = os.path.join(d, "b.cnf")
        subprocess.run([os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                     "bin", "encode_b"),
                        str(a), str(b), str(n), pb],
                       check=True, capture_output=True)
        hb, cb = read_dimacs(pb)
    nv, cls_a = encode(a, b, n)
    ca = Counter(tuple(sorted(set(c))) for c in cls_a)
    ha = (str(nv), str(len(cls_a)))
    return ha == hb and ca == cb, ha, hb, (ca - cb), (cb - ca)


if __name__ == "__main__":
    cases = []
    for a in range(1, 13):
        for b in range(1, 13):
            cases += [(a, b, 1), (a, b, 2), (a, b, 7), (a, b, 31), (a, b, 150)]
    cases += [(25, 16, 400), (29, 18, 500), (5, 3, 186), (29, 3, 700), (1, 1, 14)]
    bad = 0
    for (a, b, n) in cases:
        ok, ha, hb, only_a, only_b = compare(a, b, n)
        if not ok:
            bad += 1
            print(f"MISMATCH a={a} b={b} n={n}: headerA={ha} headerB={hb} "
                  f"onlyA={list(only_a)[:3]} onlyB={list(only_b)[:3]}")
    print(f"{len(cases)} instances compared, {bad} mismatches")
    sys.exit(1 if bad else 0)
