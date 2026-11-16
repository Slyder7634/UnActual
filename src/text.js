const STOP = new Set("a an the and or of to in on for with is are be this that it as at by from".split(" "));

export function tokenize(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_.\-/]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export function tfidf(docs) {
  const df = new Map();
  for (const toks of docs) {
    for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const N = docs.length;

  return docs.map((toks) => {
    const tf = new Map();
    for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);

    const vec = new Map();
    let norm = 0;
    for (const [t, c] of tf) {
      const idf = Math.log((1 + N) / (1 + df.get(t))) + 1;
      const w = (c / toks.length) * idf;
      vec.set(t, w);
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [t, w] of vec) vec.set(t, w / norm);
    return vec;
  });
}

export function cosine(a, b) {
  const [small, big] = a.size < b.size ? [a, b] : [b, a];
  let s = 0;
  for (const [t, w] of small) s += w * (big.get(t) ?? 0);
  return s;
}