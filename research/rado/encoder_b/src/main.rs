//! Encoder B -- deliberately independent of encoder A (encode.py).
//!
//! A DRAT proof shows that a CNF is unsatisfiable. It says nothing about
//! whether that CNF encodes the question we meant to ask. An encoder bug that
//! emits too many clauses makes an instance UNSAT and drat-trim will happily
//! certify it. That is the one place where this whole argument can silently
//! break, so the encoding is written twice, by different means, and the two
//! outputs must be byte-identical after normalisation.
//!
//! Where A derives x from divisibility (x must be a multiple of b/gcd(a,b))
//! and then walks y, B walks (y, z) directly and keeps the pairs for which
//! b*(z-y) is divisible by a and the resulting x is in range. Same set of
//! triples, arrived at from the other side of the equation.

use std::env;
use std::fs::File;
use std::io::{BufWriter, Write};

fn var(i: u64, c: u64) -> i64 {
    (3 * (i - 1) + c + 1) as i64
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 5 {
        eprintln!("usage: encode_b <a> <b> <n> <out.cnf> [--no-symmetry]");
        std::process::exit(2);
    }
    let a: u64 = args[1].parse().expect("a");
    let b: u64 = args[2].parse().expect("b");
    let n: u64 = args[3].parse().expect("n");
    let symmetry = !args.iter().any(|s| s == "--no-symmetry");

    let mut clauses: Vec<Vec<i64>> = Vec::new();

    // at least one colour
    for i in 1..=n {
        clauses.push(vec![var(i, 0), var(i, 1), var(i, 2)]);
    }
    // at most one colour, pairwise
    for i in 1..=n {
        clauses.push(vec![-var(i, 0), -var(i, 1)]);
        clauses.push(vec![-var(i, 0), -var(i, 2)]);
        clauses.push(vec![-var(i, 1), -var(i, 2)]);
    }
    // conflict clauses: walk (y, z) and solve for x, rather than walking x
    let mut triples: Vec<(u64, u64, u64)> = Vec::new();
    for z in 2..=n {
        for y in 1..z {
            let rhs = b * (z - y); // = a * x
            if rhs % a != 0 {
                continue;
            }
            let x = rhs / a;
            if x >= 1 && x <= n {
                triples.push((x, y, z));
            }
        }
    }
    // sort so the clause order matches encoder A (x ascending, then y)
    triples.sort_by_key(|&(x, y, _)| (x, y));
    for &(x, y, z) in &triples {
        for c in 0..3 {
            let mut lits = vec![-var(x, c), -var(y, c), -var(z, c)];
            lits.sort();
            lits.dedup();
            clauses.push(lits);
        }
    }
    if symmetry {
        clauses.push(vec![-var(1, 1)]);
        clauses.push(vec![-var(1, 2)]);
    }

    let f = File::create(&args[4]).expect("create output");
    let mut w = BufWriter::new(f);
    writeln!(w, "c 3-colour Rado, equation {}x + {}y = {}z, n = {}", a, b, b, n).unwrap();
    writeln!(w, "c encoder B (encode_b.rs), symmetry_breaking={}", symmetry).unwrap();
    writeln!(w, "p cnf {} {}", 3 * n, clauses.len()).unwrap();
    for cl in &clauses {
        for l in cl {
            write!(w, "{} ", l).unwrap();
        }
        writeln!(w, "0").unwrap();
    }
    eprintln!("vars={} clauses={} triples={}", 3 * n, clauses.len(), triples.len());
}
