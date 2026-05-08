export function frequencyCount(grams) {
  const map = new Map();
  for (const g of grams) {
    const key = Array.isArray(g) ? g.join(" ") : g;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

export function topN(map, n = 20) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n);
}

export function rowsToCsv(rows) {
  const header = "keyword,count,density,title,short,full";
  const lines = rows.map((r) => {
    const kw = `"${r.keyword.replace(/"/g, '""')}"`;
    return [
      kw,
      r.count,
      r.density.toFixed(2),
      r.inTitle ? 1 : 0,
      r.inShort ? 1 : 0,
      r.inFull ? 1 : 0,
    ].join(",");
  });
  return [header, ...lines].join("\n");
}
