// refs.js：引用计数与回收（基线：删除直接回收、不看引用）
export function drop(blocks, refs, fileId) {
  const next = Object.assign({}, refs);
  delete next[fileId];
  return { refs: next, reclaimed: [], kept: Object.keys(refs).length };
}
