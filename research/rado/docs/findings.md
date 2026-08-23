# Where AZB Conjecture 1.1 actually holds

Ahmed–Zaman–Bright, *Symbolic Sets for Proving Bounds on Rado Numbers*
(arXiv:2505.12085), Conjecture 1.1:

> `R_3(ax + by = bz) = a³ + a² + (2b+1)a + 1`

with Theorem 1.3 proving the right-hand side as a **lower bound**.

Before any new value of `R_3` can be reported as evidence for or against this
conjecture, one has to know where the conjecture is even being asserted. Quoted
without side conditions — as it was in the brief this work started from — it is
false at a large fraction of points. This file records the map.

Every value below is the true `R_3`, determined by bisection on satisfiability
(monotone in `n`), and cross-validated against pure brute-force search for all
points where brute force is feasible. The two agree everywhere they overlap.

## Failure mode 1: `gcd(a, b) > 1`

The equation scales: `ax + by = bz` and `(a/d)x + (b/d)y = (b/d)z` have exactly
the same solution sets, so

```
R_3(a, b) = R_3(a/d, b/d)     with d = gcd(a, b)
```

but `f(a,b) = a³ + a² + (2b+1)a + 1` does not scale that way. Every composite
point therefore breaks the lower bound, often by a wide margin:

| a | b | gcd | f(a,b) | true R_3 | reduces to |
| --- | --- | --- | --- | --- | --- |
| 2 | 2 | 2 | 23 | 14 | (1,1) |
| 3 | 3 | 3 | 58 | 14 | (1,1) |
| 4 | 2 | 2 | 101 | 43 | (2,1) |
| 6 | 4 | 2 | 307 | 61 | (3,2) |
| 6 | 6 | 6 | 331 | 14 | (1,1) |

Verified: in all 13 composite points tested, `R_3(a,b) = R_3(a/d, b/d)` exactly.
The conjecture is evidently intended for coprime `(a, b)` only.

## Failure mode 2: `b = 1`

For `b = 1` the true value overshoots the conjecture badly, and the gap grows:

| a | f(a,1) | true R_3 | ratio |
| --- | --- | --- | --- |
| 3 | 46 | 94 | 2.04 |
| 4 | 93 | 173 | 1.86 |
| 5 | 166 | 286 | 1.72 |
| 6 | 271 | 439 | 1.62 |
| 7 | 414 | 638 | 1.54 |
| 8 | 601 | 889 | 1.48 |
| 9 | 838 | 1198 | 1.43 |

## Failure mode 3: `b` close to `a` — the lower bound itself fails

This is the one that cannot be waved away as a convention about which points
are meant. For coprime `(a, b)` with `b/a` near `1`, the true Rado number falls
**below** the expression that Theorem 1.3 proves as a lower bound:

| a | b | b/a | f(a,b) | true R_3 | |
| --- | --- | --- | --- | --- | --- |
| 4 | 3 | 0.75 | 109 | 109 | conjecture holds |
| 5 | 4 | 0.80 | 196 | 180 | **below the bound** |
| 6 | 5 | 0.83 | 319 | 300 | **below the bound** |
| 7 | 6 | 0.86 | 484 | 462 | **below the bound** |
| 8 | 7 | 0.88 | 697 | 644 | **below the bound** |

Either Theorem 1.3 carries a hypothesis excluding these points, or the
statement as quoted is not what the paper proves. The primary source could not
be read from this environment (`arxiv.org` and `ceur-ws.org` are blocked by the
egress proxy), so this is flagged, not resolved. **It has to be checked against
the paper before any of this is written up.**

## Where it does hold

For coprime `(a, b)` with `2 ≤ b` and `b/a` up to roughly `0.75`, every point
tested satisfies the conjecture exactly:

```
(4,3) (5,3) (7,2) (7,3) (7,4) (7,5) (8,3) (8,5) (9,2) (9,4) (9,5)
```

## A boundary rule, proposed and refuted

The points above suggested `b <= 3a/4` as the dividing line. It was written down
as a prediction and tested on points not used to form it (`test_boundary.py`).
It failed on the first one: `(11, 8)` has `b/a = 0.727`, comfortably inside the
supposedly safe region, yet `R_3(11,8) = 1584` against `f = 1640`.

So the boundary is not a simple ratio. The refutation is kept here rather than
the rule quietly adjusted -- the data does not currently determine where the
crossover sits, and pretending otherwise is how a conjecture gets "confirmed"
by points that were chosen after the fact.

## Consequence for choosing new points

The seven values the original brief claimed — `(25,16) (27,16) (27,17) (28,17)
(29,16) (29,17) (29,18)` — all sit at `b/a` between `0.55` and `0.64`, i.e. in
the middle of the region where the conjecture already holds at every point
tested from `a = 4` upward. They are the least informative points available:
confirming them cannot distinguish the conjecture from any of its neighbours.

The informative points are at the edges:

* `b/a` between `0.75` and `0.88` at larger `a` — where does the crossover from
  "holds" to "below the bound" actually sit, and does it move with `a`?
* `b = 1` — the ratio `R_3 / f` is decreasing in `a`; does it converge to 1?
* `b > a` — consistently `R_3 > f`, unmapped.
