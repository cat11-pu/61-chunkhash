import fs from "node:fs";
import { put } from "./store.js";
import { drop } from "./refs.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/dedup.json", "utf8"));
const stored = put({}, spec.files || []);
const refs = {};
for (const file of spec.files || []) refs[file.id] = file.chunks.length;
const cleaned = drop(stored.blocks, refs, spec.delete_id || "");
const view = render(spec);

emit("唯一块数 =", Object.keys(stored.blocks).length);
emit("写入的块数 =", stored.added);
emit("去重省下的块数 =", stored.deduped);
emit("删除后的引用计数 =", JSON.stringify(cleaned.refs));
emit("被回收的块 =", JSON.stringify(cleaned.reclaimed));
emit("仍被引用的块数 =", cleaned.kept);
emit("存储字节数 =", view.bytes);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  const bad = drop({}, { f0: 1 }, "f9");
  emit("文件不存在的错误码", bad.reclaimed.length ? "no-error" : (bad.code || "no-code"));
} catch (error) {
  emit("文件不存在的错误码", error.code || error.message);
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "唯一块数": 4,
  "写入的块数": 4,
  "去重省下的块数": 4,
  "删除后的引用计数": {
    "aa": 2,
    "bb": 1,
    "cc": 1,
    "dd": 1
  },
  "被回收的块": [],
  "仍被引用的块数": 4,
  "存储字节数": 8
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
