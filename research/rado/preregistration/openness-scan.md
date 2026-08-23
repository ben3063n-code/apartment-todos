# Openness scan — status: blocked, and why

A value is only "new" if it is absent from the literature. That cannot be
established from this environment, and this file records the attempt rather
than letting the gap pass silently.

## Routes tried, all failed

| Route | Result |
| --- | --- |
| `arxiv.org/abs/2505.12085`, `/html/`, `/pdf/` | blocked by egress proxy |
| `www.arxiv.org`, `export.arxiv.org`, arXiv API | blocked / HTTP 403 |
| `ceur-ws.org/Vol-4116/paper139.pdf` (proceedings) | blocked |
| `cs.uwaterloo.ca/~cbright/talks/sc2-2025.pdf` (slides) | blocked |
| `cs.curtisbright.com/reports/symbolic-sets-rado.pdf` | blocked (CONNECT 403) |
| Semantic Scholar API, OpenAlex, ADS, HuggingFace, alphaXiv | blocked |
| `github.com/laminazaman/RadoNumbers` (authors' code) | **reachable** |
| Web search (indexed snippets) | **reachable** |

Only the last two returned anything.

## What the reachable routes did establish

The authors' repository yielded the encoder (`generate_clauses.py`) and the
mechanically checked proof script for our equation (`AutoCase/thm.a.b.b.py`).
From the latter, the exact hypotheses of Theorem 1.3:

```
a >= 4, b >= 3, a > b, gcd(a,b) = 1, a^2 + a + b > b^2 + a*b
```

Independently corroborated by an indexed snippet of the paper itself: *"For
coprime positive integers a, b with a > b ≥ 3 and a² + a + b > b² + ba,
R₃(ax + by = bz) ≥ a³ + a² + (2b + 1)a + 1."* Two independent routes, same
statement, so the hypotheses are settled.

The repository contains **no result tables** — only code and proof outputs.

## What remains unestablished

The scope of every published table. Without it, no point can be called new,
however well determined its value is. This is orthogonal to correctness: a
value verified by the full chain here is correct whether or not it is already
in print.

Consequently **no claim of novelty is made anywhere in this work.** The seven
points are reported as independently determined, not as new. Resolving this
needs someone with unrestricted network access to read Table 1 and its
neighbours and record which `(a,b)` they cover.
