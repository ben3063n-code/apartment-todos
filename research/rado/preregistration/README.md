# Preregistration

A determination is only evidence if the claim was fixed before the answer was
known. Each episode gets a brief here, frozen and committed **before** the
first solver run, stating:

* the exact `(a, b)` and the two values of `n` to be run
* the predicted verdict at each (`SAT at n-1`, `UNSAT at n`) and what each
  possible outcome would mean
* the encoder commit, the solver versions and their binary sha256
* what would count as a refutation

`run.py` appends to `results/episodes.jsonl` and never rewrites it, so the
record includes the runs that did not come out as predicted.

## What the freeze is worth

Preregistration protects against choosing which result to report. It does not
protect against a wrong encoding, a solver bug, or a misread of the literature
— those need the cross-checks in the top-level README, and the openness scan
below.

## Openness scan

Before an episode is claimed as new, the point must be shown to be absent from
the literature. Record for each: the query, the source consulted, the date, and
what was found. A point that merely does not appear in one table is not thereby
new.

**Open at the time of writing:** the primary source (arXiv:2505.12085 and the
CEUR proceedings version) could not be read from this environment — both hosts
are blocked by the egress proxy. The exact scope of every published table, and
the exact hypotheses attached to Conjecture 1.1 and Theorem 1.3, are therefore
unverified here. Findings in `docs/findings.md` show the statements as quoted
are false at many points, which makes reading the original a precondition for
any write-up, not a formality.
