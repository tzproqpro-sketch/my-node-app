const { MongoMemoryServer } = require("mongodb-memory-server");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
async function main() {
  const server = await MongoMemoryServer.create();
  const lines = [];
  try {
    for (const file of [
      "mongodb-connect.js",
      "mongodb-crud.js",
      "mongodb-advanced.js",
    ]) {
      await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [file], {
          env: {
            ...process.env,
            MONGODB_URI: server.getUri(),
            DB_NAME: "lab23_test",
          },
        });
        lines.push("$ node " + file);
        child.stdout.on("data", (data) => {
          lines.push(data.toString().trimEnd());
          process.stdout.write(data);
        });
        child.stderr.on("data", (data) =>
          lines.push(data.toString().trimEnd()),
        );
        child.on("error", reject);
        child.on("close", (code) =>
          code === 0 ? resolve() : reject(new Error("Exit code: " + code)),
        );
      });
    }
    lines.push("All real MongoDB execution checks passed.");
  } finally {
    await fs.writeFile("test-results.txt", lines.join("\n"));
    await server.stop();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
