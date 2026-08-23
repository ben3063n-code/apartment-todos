#!/usr/bin/env python3
"""Independent witness checker.

Takes (a, b, n) and a colouring, and re-derives the constraints from the
equation itself. It never reads the CNF, so it validates the problem rather
than the encoder's opinion of the problem.

Exit 0 = the colouring is a valid witness that R_3(a,b) > n.
"""
import argparse
import sys
from math import gcd


def check(a: int, b: int, n: int, colour):
    """colour[i-1] is the colour of i. Returns (ok, message)."""
    if len(colour) != n:
        return False, f"colouring has {len(colour)} entries, expected {n}"
    if any(c not in (0, 1, 2) for c in colour):
        return False, "colouring contains a value outside {0,1,2}"
    step = b // gcd(a, b)
    checked = 0
    t = 1
    while step * t <= n:
        x = step * t
        d = a * x // b
        cx = colour[x - 1]
        for y in range(1, n - d + 1):
            z = y + d
            checked += 1
            if colour[y - 1] == cx and colour[z - 1] == cx:
                return False, (
                    f"monochromatic solution: {a}*{x} + {b}*{y} = {b}*{z} "
                    f"(check: {a*x + b*y} = {b*z}), all colour {cx}"
                )
        t += 1
    return True, f"no monochromatic solution among {checked} triples"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("a", type=int)
    p.add_argument("b", type=int)
    p.add_argument("n", type=int)
    p.add_argument("--colouring", required=True,
                   help="file with n integers in {0,1,2}, whitespace separated")
    args = p.parse_args()
    with open(args.colouring) as f:
        colour = [int(tok) for tok in f.read().split()]
    ok, msg = check(args.a, args.b, args.n, colour)
    print(("VALID   " if ok else "INVALID ") + msg)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
