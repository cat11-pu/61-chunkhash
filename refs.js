// refs.js：引用计数与回收（引用归零才回收；删不存在的文件报 E_NO_FILE）
export function drop(blocks, refs, fileId) {
  const known = Object.prototype.hasOwnProperty.call(refs, fileId);
  const counts = {};
  const reclaimed = [];
  for (const key of Object.keys(blocks)) {
    const entry = blocks[key];
    const holders = Object.assign({}, entry.refs);
    if (known) delete holders[fileId];
    let total = 0;
    for (const id of Object.keys(holders)) total += holders[id];
    if (known && total === 0) {
      reclaimed.push(entry.content);
      delete blocks[key];
    } else {
      counts[entry.content] = total;
      blocks[key] = { content: entry.content, refs: holders };
    }
  }
  const result = { refs: counts, reclaimed: reclaimed, kept: Object.keys(counts).length };
  if (!known) result.code = "E_NO_FILE";
  return result;
}
