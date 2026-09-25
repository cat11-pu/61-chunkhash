import assert from "node:assert";
import { put } from "../store.js";
import { drop } from "../refs.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const files = [{ id: "f0", chunks: ["aa", "bb"] }];

check("put returns blocks", () => {
  assert.strictEqual(typeof put({}, files).blocks, "object");
});

check("put reports added", () => {
  assert.strictEqual(typeof put({}, files).added, "number");
});

check("drop returns refs", () => {
  assert.strictEqual(typeof drop({}, { f0: 2 }, "f0").refs, "object");
});

check("drop reports reclaimed", () => {
  assert.ok(Array.isArray(drop({}, { f0: 2 }, "f0").reclaimed));
});

check("render exposes deduped", () => {
  assert.strictEqual(typeof render({ files: files, delete_id: "" }).deduped, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
