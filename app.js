// app.js：渲染结果
import { put } from "./store.js";
import { drop } from "./refs.js";

export function render(spec) {
  const stored = put({}, spec.files || []);
  const refs = {};
  for (const file of spec.files || []) refs[file.id] = file.chunks.length;
  const cleaned = drop(stored.blocks, refs, spec.delete_id || "");
  return { blocks: Object.keys(stored.blocks).length, added: stored.added,
           deduped: stored.deduped, refs: cleaned.refs, reclaimed: cleaned.reclaimed,
           bytes: Object.keys(stored.blocks).length };
}
