#!/usr/bin/env python3
"""Runner for one (a, b, n) episode.

Does the whole chain and records it:
  1. encode with encoder A  -> CNF + sha256
  2. solve with kissat and cadical; both must return the same verdict
  3. SAT   -> extract the colouring, re-check it with check_witness
              (which re-derives constraints from (a,b,n), never reads the CNF)
     UNSAT -> cadical emits a DRAT proof, drat-trim must report VERIFIED
  4. append a JSON record with every hash, time and verdict

Determining R_3 needs BOTH polarities: SAT at n-1 and UNSAT at n.
"""
import argparse, hashlib, json, os, subprocess, sys, time
from datetime import datetime, timezone
from encode import write_dimacs
from check_witness import check

HERE = os.path.dirname(os.path.abspath(__file__))
BIN = os.path.join(HERE, "bin")


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def run_solver(name, cnf, proof=None, timeout=None):
    exe = os.path.join(BIN, name)
    cmd = [exe, cnf] + ([proof] if proof else [])
    t0 = time.time()
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    elapsed = time.time() - t0
    verdict, model = None, []
    for line in p.stdout.splitlines():
        if line.startswith("s "):
            verdict = "SAT" if "UNSATISFIABLE" not in line else "UNSAT"
        elif line.startswith("v "):
            model.extend(int(t) for t in line[2:].split())
    return verdict, [x for x in model if x != 0], round(elapsed, 2)


def model_to_colouring(model, n):
    colour = [-1] * n
    for lit in model:
        if lit > 0:
            v = lit - 1
            colour[v // 3] = v % 3
    return colour


def verify_drat(cnf, proof, timeout=None):
    t0 = time.time()
    p = subprocess.run([os.path.join(BIN, "drat-trim"), cnf, proof],
                       capture_output=True, text=True, timeout=timeout)
    return ("s VERIFIED" in p.stdout), round(time.time() - t0, 2)


def episode(a, b, n, keep=False, timeout=None):
    tag = f"a{a}-b{b}-n{n}"
    cnf = os.path.join(HERE, "cnf", f"{tag}.cnf")
    proof = os.path.join(HERE, "proofs", f"{tag}.drat")
    nv, nc, cnf_hash = write_dimacs(cnf, a, b, n)

    rec = {
        "utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "a": a, "b": b, "n": n,
        "equation": f"{a}x + {b}y = {b}z",
        "vars": nv, "clauses": nc, "cnf_sha256": cnf_hash,
        "solvers": {}, "witness": None, "drat": None,
    }

    v_k, model_k, t_k = run_solver("kissat", cnf, timeout=timeout)
    rec["solvers"]["kissat-4.0.4"] = {"verdict": v_k, "seconds": t_k}

    if v_k == "UNSAT":
        v_c, _, t_c = run_solver("cadical", cnf, proof=proof, timeout=timeout)
        rec["solvers"]["cadical-3.0.1"] = {"verdict": v_c, "seconds": t_c}
        if v_c == "UNSAT" and os.path.exists(proof):
            ok, t_d = verify_drat(cnf, proof, timeout=timeout)
            rec["drat"] = {"verified": ok, "seconds": t_d,
                           "bytes": os.path.getsize(proof),
                           "sha256": sha256_file(proof)}
            if not keep:
                os.remove(proof)
    else:
        v_c, model_c, t_c = run_solver("cadical", cnf, timeout=timeout)
        rec["solvers"]["cadical-3.0.1"] = {"verdict": v_c, "seconds": t_c}
        colouring = model_to_colouring(model_k, n)
        ok, msg = check(a, b, n, colouring)
        wit = os.path.join(HERE, "results", f"{tag}.colouring")
        with open(wit, "w") as f:
            f.write(" ".join(map(str, colouring)) + "\n")
        rec["witness"] = {"independently_checked": ok, "detail": msg,
                          "sha256": sha256_file(wit)}

    rec["agree"] = (v_k == v_c and v_k is not None)
    rec["verdict"] = v_k if rec["agree"] else "DISAGREEMENT"
    if not keep:
        os.remove(cnf)
    return rec


def main():
    p = argparse.ArgumentParser()
    p.add_argument("a", type=int); p.add_argument("b", type=int)
    p.add_argument("n", type=int, nargs="+")
    p.add_argument("--log", default=os.path.join(HERE, "results", "episodes.jsonl"))
    p.add_argument("--keep", action="store_true")
    p.add_argument("--timeout", type=float, default=None)
    args = p.parse_args()
    for n in args.n:
        rec = episode(args.a, args.b, n, keep=args.keep, timeout=args.timeout)
        with open(args.log, "a") as f:          # append-only
            f.write(json.dumps(rec) + "\n")
        s = rec["solvers"]
        print(f"a={rec['a']} b={rec['b']} n={rec['n']}: {rec['verdict']:6} "
              f"kissat={s['kissat-4.0.4']['seconds']}s "
              f"cadical={s['cadical-3.0.1']['seconds']}s "
              f"vars={rec['vars']} clauses={rec['clauses']} "
              + (f"witness={rec['witness']['independently_checked']}" if rec["witness"]
                 else f"drat={rec['drat']['verified'] if rec['drat'] else None}"))


if __name__ == "__main__":
    main()
