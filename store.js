// store.js：分块与去重（按内容索引入桶，相同内容只存一份）
export function put(blocks, files) {
  const next = Object.assign({}, blocks);
  let added = 0;
  let deduped = 0;
  for (const file of files) {
    for (const piece of file.chunks) {
      const key = "b#" + piece;
      const current = next[key];
      const holders = Object.assign({}, current ? current.refs : null);
      holders[file.id] = (holders[file.id] || 0) + 1;
      next[key] = { content: piece, refs: holders };
      if (current) { deduped += 1; } else { added += 1; }
    }
  }
  return { blocks: next, added: added, deduped: deduped };
}
