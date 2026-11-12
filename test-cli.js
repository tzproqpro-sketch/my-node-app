const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const folder = fs.mkdtempSync(path.join(os.tmpdir(), "lab17-"));
const lines = [];
function run(args, code = 0, input = "") {
  const result = spawnSync(process.execPath, ["cli.js", ...args], {
    input,
    encoding: "utf8",
  });
  lines.push(
    "$ node cli.js " + args.join(" "),
    result.stdout + result.stderr,
    "Exit code: " + result.status,
  );
  assert.equal(result.status, code, result.stderr);
  return result.stdout;
}
try {
  assert.match(run([]), /Usage/);
  assert.match(run(["greet", "Trofim"]), /Hello, Trofim/);
  run(["info"]);
  run(["unknown"], 1);
  run(["--version"]);
  run(["generate", "--help"]);
  run(["generate", "-t", "unknown"], 1);
  const output = path.join(folder, "report.json");
  run(["generate", "-t", "json", "-o", output, "--dry-run"]);
  assert.equal(fs.existsSync(output), false);
  run(["generate", "-t", "json", "-o", output, "--verbose"]);
  assert.equal(JSON.parse(fs.readFileSync(output)).lab, 17);
  run(["generate", "-t", "json", "-o", output], 1);
  run(["generate", "-t", "json", "-o", output, "--force"]);
  const pdf = path.join(folder, "report.pdf");
  run(["generate", "-t", "pdf", "-o", pdf]);
  assert.equal(fs.readFileSync(pdf).subarray(0, 4).toString(), "%PDF");
  run([
    "init",
    "--name",
    "demo",
    "--type",
    "cli",
    "--typescript",
    "--git",
    "--no-interactive",
  ]);
  run(["init", "--no-interactive"], 1);
  run(["init", "--type", "web"], 0, "piped-project\n");
  run(["init"], 1, "piped-project\n");
  lines.push("All automated CLI checks passed.");
} finally {
  fs.writeFileSync(
    "test-results.txt",
    lines
      .join("\n")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n"),
  );
  fs.rmSync(folder, { recursive: true, force: true });
}
console.log(lines.join("\n"));
