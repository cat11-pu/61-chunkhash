// app.js：渲染结果
import { put } from "./store.js";
import { drop } from "./refs.js";

export function render(spec) {
  const files = spec.files || [];
  const stored = put({}, files);
  const refs = {};
  for (const file of files) refs[file.id] = file.chunks.length;
  const cleaned = drop(stored.blocks, refs, spec.delete_id || "");
  const remaining = cleaned.blocks || stored.blocks;
  const encoder = new TextEncoder();
  let bytes = 0;
  for (const key of Object.keys(remaining)) bytes += encoder.encode(key).length;
  return { blocks: Object.keys(stored.blocks).length, added: stored.added,
           deduped: stored.deduped, refs: cleaned.refs, reclaimed: cleaned.reclaimed,
           bytes: bytes };
}
