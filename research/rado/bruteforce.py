#!/usr/bin/env python3
"""Ground-truth R_3 by exhaustive search. Never touches a CNF or a SAT solver.

This exists to validate the encoder: for small (a, b) the Rado number computed
here and the one computed through the SAT pipeline must agree. Any encoder bug
that makes instances spuriously UNSAT shows up as a disagreement.

Search: assign colours to 1, 2, ... in order; after coluring i, reject if some
solution triple whose largest member is i is now monochromatic. Colour of 1 is
fixed to 0 (the three colours are freely permutable).
"""
import argparse
import sys
from encode import solution_triples


def triples_by_max(a: int, b: int, n: int):
    """buckets[i] = triples (x, y, z) with max(x, y, z) == i."""
    buckets = [[] for _ in range(n + 1)]
    for (x, y, z) in solution_triples(a, b, n):
        buckets[max(x, y, z)].append((x, y, z))
    return buckets


def colourable(a: int, b: int, n: int):
    """Return a valid colouring of {1..n} as a list, or None if none exists."""
    buckets = triples_by_max(a, b, n)
    colour = [-1] * (n + 1)

    def ok(i):
        for (x, y, z) in buckets[i]:
            c = colour[x]
            if c != -1 and colour[y] == c and colour[z] == c:
                return False
        return True

    def dfs(i):
        if i > n:
            return True
        top = 1 if i == 1 else 3          # symmetry: colour(1) = 0
        for c in range(top):
            colour[i] = c
            if ok(i) and dfs(i + 1):
                return True
        colour[i] = -1
        return False

    return colour[1:] if dfs(1) else None


def rado_number(a: int, b: int, limit: int = 4000):
    """Smallest n such that {1..n} is not 3-colourable without a mono solution."""
    n = 1
    while n <= limit:
        if colourable(a, b, n) is None:
            return n
        n += 1
    return None


def main():
    p = argparse.ArgumentParser()
    p.add_argument("a", type=int)
    p.add_argument("b", type=int)
    p.add_argument("--limit", type=int, default=4000)
    args = p.parse_args()
    r = rado_number(args.a, args.b, args.limit)
    print(r if r is not None else f"> {args.limit}")


if __name__ == "__main__":
    main()
