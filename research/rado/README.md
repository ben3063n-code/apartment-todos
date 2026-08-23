# 3-colour Rado numbers for `ax + by = bz`

`R_3(a,b)` is the smallest `n` such that every 3-colouring of `{1..n}` contains
a monochromatic solution to `ax + by = bz`.

This directory holds a harness for determining single values of `R_3` with a
verifiable chain of evidence, plus the studies that had to happen before any
determination could be claimed as new.

Reference: Tanbir Ahmed, Lamina Zaman, Curtis Bright, *Symbolic Sets for
Proving Bounds on Rado Numbers*, arXiv:2505.12085 (SC² 2025). Their
Conjecture 1.1 predicts `R_3 = a³ + a² + (2b+1)a + 1`; their Theorem 1.3
proves that expression as a lower bound.

## What a determination requires

A single solver verdict determines nothing. Every claimed value of `R_3` needs
**both polarities**:

* SAT at `n = R-1` — a 3-colouring with no monochromatic solution exists, so `R_3 > R-1`
* UNSAT at `n = R` — no such colouring exists, so `R_3 ≤ R`

Neither half alone fixes a value.

## The evidence chain

| Layer | What it rules out |
| --- | --- |
| Two solvers (kissat 4.0.4, cadical 3.0.1) must agree | a solver bug on one implementation |
| UNSAT carries a DRAT proof checked by drat-trim | the solver being wrong about unsatisfiability |
| SAT witness re-checked by `check_witness.py`, which re-derives the triples from `(a,b,n)` and never reads the CNF | the encoder being wrong on the SAT side |
| Two independently written encoders (`encode.py`, `encoder_b/src/main.rs`) must produce identical clause multisets | **the encoder being wrong on the UNSAT side** |
| Encoder output validated against pure brute force (`bruteforce.py`) for small `(a,b)` | both encoders sharing a misreading of the problem |

The fourth row is the one that is easy to leave out and the one that matters
most. A DRAT proof certifies that *the CNF* is unsatisfiable. It says nothing
about whether the CNF asks the intended question. An encoder that emits too
many clauses produces an UNSAT instance and a perfectly valid DRAT proof of it.
On the SAT side an independent witness checker catches this; on the UNSAT side
nothing does, unless the encoding itself is cross-checked.

## Layout

```
encode.py            encoder A (Python) -- the reference encoding
encoder_b/           encoder B (Rust)   -- independent second implementation
compare_encoders.py  cross-check A against B as clause multisets
bruteforce.py        R_3 by exhaustive search, no CNF, no solver
check_witness.py     independent witness checker for the SAT side
run.py               one episode: encode, solve twice, verify, append JSON
sweep.py             fast pysat-based satisfiability probe
study_scope.py       true R_3 over a grid, vs. Theorem 1.3 and Conjecture 1.1
study_coprime.py     the same restricted to gcd(a,b) = 1
results/             append-only episode records (JSONL) and witnesses
preregistration/     briefs frozen before solver contact, with hashes
```

## Reproducing

```
cd research/rado
python3 compare_encoders.py            # encoders agree on 725 instances
python3 run.py 5 3 185 186             # published control: R_3(5,3) = 186
python3 study_scope.py 6 6             # where the conjecture actually holds
```

Solver binaries are not committed (see `.gitignore`). Build them with:

```
git clone --depth 1 https://github.com/arminbiere/kissat   && (cd kissat   && ./configure && make)
git clone --depth 1 https://github.com/arminbiere/cadical  && (cd cadical  && ./configure && make)
git clone --depth 1 https://github.com/marijnheule/drat-trim && (cd drat-trim && make)
```

Verified builds used here: kissat 4.0.4, cadical 3.0.1, drat-trim at commit
`2e3b2dc0ecf938addbd779d42877b6ed69d9a985`.
