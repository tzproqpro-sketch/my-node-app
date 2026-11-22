const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const lines = [];
for (const file of [
  "stream-readable.js",
  "stream-writable.js",
  "stream-pipe.js",
])
  lines.push(
    "$ node " + file,
    execFileSync(process.execPath, [file], { encoding: "utf8" }).trimEnd(),
  );
const output = lines.join("\n");
for (const expected of ["[CHUNK 1]", "[CHUNK 2]", "[CHUNK 3]", "[CHUNK 4]", "[END] Chunks: 4", "write() returned: false", "[DRAIN]", "[FINISH] Written chunks: 4", "destination destroyed: false", "all streams destroyed: true"]) {
  assert.ok(output.includes(expected), "Missing demonstration: " + expected);
}
assert.ok(output.indexOf("[CHUNK 1]") < output.indexOf("[CHUNK 4]"));
const input = fs.readFileSync("input.txt", "utf8");
assert.equal(fs.readFileSync("output-pipe.txt", "utf8"), input);
assert.equal(fs.readFileSync("output-pipeline.txt", "utf8"), input);
assert.equal(fs.readFileSync("output-chain.txt", "utf8"), input.toUpperCase().split("").reverse().join(""));
lines.push("All stream checks passed.");
fs.writeFileSync(
  "test-results.txt",
  lines
    .join("\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n"),
);
console.log(lines.join("\n"));
