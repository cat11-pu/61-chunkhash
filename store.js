// store.js：分块与去重（按内容索引入桶，相同内容只存一份）
// blocks 的值形状：{ content: 块内容, users: [引用它的文件 id] }
function usersOf(entry) {
  return entry && typeof entry === "object" && Array.isArray(entry.users) ? entry.users : [];
}

export function put(blocks, files) {
  const next = Object.assign({}, blocks);
  let added = 0;
  let deduped = 0;
  for (const file of files) {
    for (const piece of file.chunks) {
      const entry = next[piece];
      if (entry === undefined) {
        next[piece] = { content: piece, users: [file.id] };
        added += 1;
      } else {
        deduped += 1;
        const users = usersOf(entry);
        if (!users.includes(file.id)) {
          next[piece] = { content: piece, users: users.concat(file.id) };
        }
      }
    }
  }
  return { blocks: next, added: added, deduped: deduped };
}
