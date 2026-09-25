// store.js：分块与去重（基线：每块都存、不去重）
export function put(blocks, files) {
  const next = Object.assign({}, blocks);
  let added = 0;
  for (const file of files) {
    for (const piece of file.chunks) {
      next[file.id + "#" + piece] = piece;
      added += 1;
    }
  }
  return { blocks: next, added: added, deduped: 0 };
}
