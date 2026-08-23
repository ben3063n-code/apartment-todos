#!/usr/bin/env python3
"""Encoder A: CNF for the 3-colour Rado question on a*x + b*y = b*z.

Question encoded: does a 3-colouring of {1..n} exist with NO monochromatic
solution (x, y, z) in [1,n]^3 to a*x + b*y = b*z?

  SAT   at n  ->  such a colouring exists  ->  R_3 > n
  UNSAT at n  ->  every 3-colouring has one ->  R_3 <= n

Variable v(i, c) = 3*(i-1) + c + 1  for i in 1..n, c in 0..2.

Clauses:
  ALO   n            each number gets at least one colour
  AMO   3n           each number gets at most one colour (pairwise)
  CONF  3 * T        for every solution triple and every colour, forbid
                     all three members carrying that colour
  SYM   2            colour(1) := 0; safe because the three colours are
                     freely permutable in any solution

This file is the ONLY place the problem is turned into CNF for encoder A.
Encoder B (encode_b.rs) is written independently and must agree.
"""
import argparse
import hashlib
import sys
from math import gcd


def solution_triples(a: int, b: int, n: int):
    """Yield every (x, y, z) in [1,n]^3 with a*x + b*y = b*z.

    a*x + b*y = b*z  <=>  b*(z - y) = a*x, so b | a*x, i.e. (b/gcd(a,b)) | x.
    Write x = step*t with step = b // gcd(a, b); then z = y + a*x//b.
    """
    step = b // gcd(a, b)
    t = 1
    while step * t <= n:
        x = step * t
        d = a * x // b          # z - y, always >= 1
        for y in range(1, n - d + 1):
            yield (x, y, y + d)
        t += 1


def count_triples(a: int, b: int, n: int) -> int:
    """Closed-form count of the triples above, for cross-checking."""
    step = b // gcd(a, b)
    total = 0
    t = 1
    while step * t <= n:
        d = a * step * t // b
        if d < n:
            total += n - d
        t += 1
    return total


def var(i: int, c: int) -> int:
    return 3 * (i - 1) + c + 1


def encode(a: int, b: int, n: int, symmetry: bool = True):
    """Return (n_vars, list_of_clauses)."""
    if a < 1 or b < 1 or n < 1:
        raise ValueError("a, b, n must all be >= 1")
    clauses = []
    for i in range(1, n + 1):
        clauses.append([var(i, 0), var(i, 1), var(i, 2)])
    for i in range(1, n + 1):
        clauses.append([-var(i, 0), -var(i, 1)])
        clauses.append([-var(i, 0), -var(i, 2)])
        clauses.append([-var(i, 1), -var(i, 2)])
    for (x, y, z) in solution_triples(a, b, n):
        for c in range(3):
            lits = sorted({-var(x, c), -var(y, c), -var(z, c)})
            clauses.append(lits)
    if symmetry:
        clauses.append([-var(1, 1)])
        clauses.append([-var(1, 2)])
    return 3 * n, clauses


def iter_clauses(a, b, n, symmetry=True):
    """Same clauses as encode(), yielded one at a time.

    encode() materialises every clause in a list, which costs several GB at
    n ~ 20000 and got a run killed. Streaming keeps memory flat; the clause
    count needed for the DIMACS header comes from count_triples() instead of
    len().
    """
    if a < 1 or b < 1 or n < 1:
        raise ValueError("a, b, n must all be >= 1")
    for i in range(1, n + 1):
        yield [var(i, 0), var(i, 1), var(i, 2)]
    for i in range(1, n + 1):
        yield [-var(i, 0), -var(i, 1)]
        yield [-var(i, 0), -var(i, 2)]
        yield [-var(i, 1), -var(i, 2)]
    for (x, y, z) in solution_triples(a, b, n):
        for c in range(3):
            yield sorted({-var(x, c), -var(y, c), -var(z, c)})
    if symmetry:
        yield [-var(1, 1)]
        yield [-var(1, 2)]


def clause_count(a, b, n, symmetry=True):
    """Closed form for the number of clauses iter_clauses() will yield."""
    return 3 * count_triples(a, b, n) + 4 * n + (2 if symmetry else 0)


def write_dimacs(path, a, b, n, symmetry=True):
    n_vars = 3 * n
    n_clauses = clause_count(a, b, n, symmetry)
    h = hashlib.sha256()
    written = 0
    with open(path, "w") as f:
        header = f"p cnf {n_vars} {n_clauses}\n"
        f.write(f"c 3-colour Rado, equation {a}x + {b}y = {b}z, n = {n}\n")
        f.write(f"c encoder A (encode.py), symmetry_breaking={symmetry}\n")
        f.write(header)
        h.update(header.encode())
        for cl in iter_clauses(a, b, n, symmetry):
            line = " ".join(map(str, cl)) + " 0\n"
            f.write(line)
            h.update(line.encode())
            written += 1
    if written != n_clauses:
        raise RuntimeError(
            f"header promised {n_clauses} clauses but {written} were written")
    return n_vars, n_clauses, h.hexdigest()


def main():
    p = argparse.ArgumentParser()
    p.add_argument("a", type=int)
    p.add_argument("b", type=int)
    p.add_argument("n", type=int)
    p.add_argument("-o", "--out", required=True)
    p.add_argument("--no-symmetry", action="store_true")
    args = p.parse_args()
    nv, nc, digest = write_dimacs(
        args.out, args.a, args.b, args.n, symmetry=not args.no_symmetry
    )
    print(f"vars={nv} clauses={nc} sha256={digest} file={args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
