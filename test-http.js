const { createServer } = require("./http-server");
const assert = require("node:assert/strict");
const fs = require("node:fs");
async function main() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  const lines = [];
  async function request(route, options, status = 200) {
    const response = await fetch(base + route, options);
    const text = await response.text();
    assert.equal(response.status, status, text);
    lines.push(
      (options?.method || "GET") + " " + route + " -> " + response.status,
      text,
      "X-Group: " + response.headers.get("x-group"),
    );
    return text;
  }
  try {
    await request("/");
    await request("/about");
    await request("/missing", {}, 404);
    const headers = JSON.parse(
      await request("/headers", { headers: { "User-Agent": "Lab20-check" } }),
    );
    assert.equal(headers.headers["user-agent"], "Lab20-check");
    assert.equal(JSON.parse(await request("/headers/set")).removed, true);
    assert.equal(JSON.parse(await request("/headers/check")).hasUnknown, false);
    await request("/headers/set", { method: "HEAD" });
    const echo = JSON.parse(
      await request("/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"message":"Hello"}',
      }),
    );
    assert.deepEqual(echo, { message: "Hello", group: "477" });
    assert.equal(
      await request("/echo", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "Hello",
      }),
      "Hello",
    );
    assert.equal(
      JSON.parse(
        await request("/form", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "name=Trofim&group=477",
        }),
      ).name,
      "Trofim",
    );
    await request(
      "/echo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      },
      400,
    );
    await request(
      "/echo",
      { method: "POST", body: "a".repeat(1024 * 1024 + 1) },
      413,
    );
    const binary = new Uint8Array([0, 255, 128, 10]);
    const response = await fetch(base + "/echo", {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: binary,
    });
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), binary);
    lines.push("Binary echo verified. All HTTP checks passed.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.writeFileSync("test-results.txt", lines.join("\n"));
  }
  console.log(lines.join("\n"));
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
