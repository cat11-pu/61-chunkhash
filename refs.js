// refs.js：引用计数与回收（引用降到零才回收，别人还在用的块绝不动）
function usersOf(entry) {
  return entry && typeof entry === "object" && Array.isArray(entry.users) ? entry.users : [];
}

function liveCounts(blocks) {
  const counts = {};
  for (const key of Object.keys(blocks)) {
    const n = usersOf(blocks[key]).length;
    if (n > 0) counts[key] = n;
  }
  return counts;
}

export function drop(blocks, refs, fileId) {
  if (!fileId) {
    const counts = liveCounts(blocks);
    return { refs: counts, reclaimed: [], kept: Object.keys(counts).length,
             blocks: Object.assign({}, blocks) };
  }
  if (!Object.prototype.hasOwnProperty.call(refs, fileId)) {
    const error = new Error("E_NO_FILE: " + fileId);
    error.code = "E_NO_FILE";
    throw error;
  }
  const nextRefs = {};
  const nextBlocks = {};
  const reclaimed = [];
  for (const key of Object.keys(blocks)) {
    const users = usersOf(blocks[key]).filter((id) => id !== fileId);
    if (users.length === 0) {
      reclaimed.push(key);
    } else {
      nextRefs[key] = users.length;
      nextBlocks[key] = { content: key, users: users };
    }
  }
  return { refs: nextRefs, reclaimed: reclaimed, kept: Object.keys(nextRefs).length,
           blocks: nextBlocks };
}
