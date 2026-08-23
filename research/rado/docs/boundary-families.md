# Two families outside the conjecture's scope

Conjecture 1.1 is asserted only for `a ≥ 4`, `b ≥ 3`, `a > b`, `gcd(a,b) = 1`
and `a² + a + b > b² + ab`. The excluded regions are not thereby uninteresting
— they are simply not what the conjecture is about. Two of them turn out to
have exact closed forms.

## `b = 1`: the equation `ax + y = z`

```
R_3(ax + y = z) = a³ + 5a² + 7a + 1
```

Exact at every value tested, `a = 1` through `a = 12`:

| a | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R_3 | 14 | 43 | 94 | 173 | 286 | 439 | 638 | 889 | 1198 | 1571 | 2014 | 2533 |

At `a = 1` this gives 14, the 3-colour Schur number, which is the known value
for `x + y = z` and an independent check on the family.

Compare `f(a,1) = a³ + a² + 3a + 1`: the difference is exactly `4a(a+1)`, so
the conjecture's expression undershoots by a quadratic amount here. This is
consistent with `b ≥ 3` being a real hypothesis rather than a convenience.

## `a = 1`: the equation `x + by = bz`

```
R_3(x + by = bz) = b³        for b ≥ 3
```

Exact at `b = 3` through `b = 9`: 27, 64, 125, 216, 343, 512, 729. At `b = 1`
and `b = 2` the value is 14 in both cases, not `b³` — the pattern starts at 3,
which is again where the conjecture's own `b ≥ 3` sits.

## Status of these two results

Both were found here by measurement and hold at every point tested, but neither
is proved, and **neither has been checked against the literature**. Rado numbers
for `ax + y = z` are a much-studied family and a closed form for the 3-colour
case may well be known; a targeted search turned up nothing matching
`a³ + 5a² + 7a + 1`, but the search could not reach the main sources (the
egress proxy blocks arxiv.org, ceur-ws.org and the two university hosts).
Treat them as conjectures with strong numerical support, not as new results,
until someone reads the literature.

Every value here comes from the same verified chain as the rest of this work:
bisection on satisfiability with two solvers, SAT witnesses re-checked
independently, and brute-force agreement wherever brute force is feasible.
