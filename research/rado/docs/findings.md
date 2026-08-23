# Conjecture 1.1 and Theorem 1.3, tested against measurement

Ahmed–Zaman–Bright, *Symbolic Sets for Proving Bounds on Rado Numbers*
(arXiv:2505.12085), for `R_3(ax + by = bz)` with
`f(a,b) = a³ + a² + (2b+1)a + 1`.

## The hypotheses matter, and the brief dropped them

The brief this work started from quoted Conjecture 1.1 and Theorem 1.3 as bare
formulas. They are not bare. From the authors' own proof script
(`AutoCase/thm.a.b.b.py` in `github.com/laminazaman/RadoNumbers`, which
mechanically verifies Theorem 1.3 with these assumptions and no others):

```python
assumptions = [
    a >= 4, b >= 3, a > b, a**2 + a + b > b**2 + a * b,
    Eq(coprime(a, b), 1)
]
```

and the theorem statement as the script itself renders it:

> Given positive integers `a` and `b` with `a²+a+b > b²+ab` and `a ≥ b ≥ 3`,
> if `gcd(a, b) = 1`, then `R_3(E(3,0;a,b,b)) ≥ a³ + a² + (2b+1)a + 1`.

The last condition, `a² + a + b > b² + ab`, is the load-bearing one. It is not
a ratio and cannot be approximated by one — an earlier attempt here to fit
`b ≤ 3a/4` to the data failed on `(11,8)` and `(16,11)`, both of which the real
condition excludes correctly.

## What 64 measured points say

Every value below is the true `R_3`, found by bisection on satisfiability and
cross-validated against CNF-free brute-force search wherever brute force is
feasible.

| | count |
| --- | --- |
| points measured | 64 |
| lower bound violated **inside** the hypotheses | **0** |
| lower bound violated outside them | 24 |
| inside the hypotheses, `R_3 = f(a,b)` exactly | **10** |
| inside the hypotheses, `R_3 ≠ f(a,b)` | **0** |

So: **Theorem 1.3 survives every point measured here, and Conjecture 1.1 holds
with exact equality at all 10 in-scope points**, namely

```
(4,3) (5,3) (7,3) (7,4) (7,5) (8,3) (8,5) (9,4) (9,5) (10,3)
```

This is an independent empirical confirmation of both, obtained without reading
the paper's tables — the hypotheses were recovered from the proof script, and
the numbers from our own solver chain.

## The 24 apparent violations were all out of scope

Each one fails a stated hypothesis. Representative cases:

| a | b | f(a,b) | true R_3 | excluded because |
| --- | --- | --- | --- | --- |
| 6 | 6 | 331 | 14 | `gcd = 6`, `a ≤ b`, `a²+a+b ≤ b²+ab` |
| 4 | 2 | 101 | 43 | `gcd = 2`, `b < 3` |
| 5 | 4 | 196 | 180 | `a²+a+b ≤ b²+ab` (34 ≤ 36) |
| 8 | 7 | 697 | 644 | `a²+a+b ≤ b²+ab` (79 ≤ 105) |
| 11 | 8 | 1640 | 1584 | `a²+a+b ≤ b²+ab` (140 ≤ 152) |
| 16 | 11 | 4721 | 4576 | `a²+a+b ≤ b²+ab` (283 ≤ 297) |

The `gcd > 1` family has a clean explanation of its own: the equation scales, so
`R_3(a,b) = R_3(a/d, b/d)` with `d = gcd(a,b)`, verified exactly at all 13
composite points tested. `f` does not scale that way, which is why the
coprimality hypothesis is there.

## Where this leaves the seven claimed points

All seven satisfy every hypothesis, so the conjecture is at least being applied
in scope:

| a | b | `a²+a+b − (b²+ab)` | margin |
| --- | --- | --- | --- |
| 25 | 16 | 10 | **tightest** |
| 27 | 17 | 25 | |
| 29 | 18 | 42 | |
| 28 | 17 | 64 | |
| 27 | 16 | 84 | |
| 29 | 17 | 105 | |
| 29 | 16 | 166 | |

`(25,16)` sits close to the boundary of the proved region, which makes it a
better-chosen point than it first appeared. That correction is owed: an earlier
note here called all seven uninformative on the basis of `b/a`, which is the
wrong coordinate.

The open question is no longer whether these points are in scope. It is whether
the claimed values are the true ones — determined here, not asserted.

## Still open

The paper's tables could not be read: `arxiv.org`, `ceur-ws.org`,
`cs.uwaterloo.ca` and `cs.curtisbright.com` are all blocked by this
environment's egress proxy, and the authors' repository contains the encoder and
the proof scripts but no result tables. So the *novelty* of any point — whether
it already appears in a published table — remains unverified, independently of
whether the value itself is correct.

## Verification status of the eight determinations

All eight (seven claimed points plus the (29,3) control) are determined with
both polarities: SAT at `R-1` with an independently re-checked witness, UNSAT
at `R` with a drat-trim-verified DRAT proof, kissat and cadical agreeing on
every verdict. Every claimed value reproduces exactly.

The formally verified checker `cake_lpr` reaches only part of the way. Its
memory need scales with the LRAT proof, and this machine has 15 GB with no
swap available:

| (a,b) | LRAT | cake_lpr |
| --- | --- | --- |
| (25,16) | 149 MB | verified |
| (27,16) | 210 MB | verified |
| (27,17) | 212 MB | verified |
| (28,17) | 253 MB | verified |
| (29,3) | 283 MB | heap exhausted |
| (29,16) | 298 MB | heap exhausted |
| (29,17) | 298 MB | heap exhausted |
| (29,18) | 301 MB | heap exhausted |

So four of eight carry a proof checked by a verified checker. The other four
rest on drat-trim, which is unverified C. They are **well evidenced but not
formally verified**, and are not described otherwise anywhere here. Clearing
them needs a machine with more memory, not more work.
