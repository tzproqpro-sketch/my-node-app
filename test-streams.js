const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
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
