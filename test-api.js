const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient } = require("mongodb");
const { createApp } = require("./app");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
async function main() {
  const mongo = await MongoMemoryServer.create();
  const client = new MongoClient(mongo.getUri());
  let server;
  const lines = [];
  try {
    await client.connect();
    const app = await createApp(client.db("lab24_test"));
    server = app.listen(0);
    const base = "http://127.0.0.1:" + server.address().port;
    async function request(path, method = "GET", data, expected = 200) {
      const response = await fetch(base + "/api/users" + path, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(data ? { body: JSON.stringify(data) } : {}),
      });
      const text = await response.text();
      assert.equal(response.status, expected, text);
      assert.equal(response.headers.get("x-group"), "BBMO-01-23");
      lines.push(method + " " + path + " -> " + response.status, text);
      return response.headers.get("content-type").includes("json")
        ? JSON.parse(text)
        : text;
    }
    const data = {
      name: "Trofim Zubelik",
      email: "trofim@example.com",
      group_name: "BBMO-01-23",
      age: 20,
      course: 2,
    };
    const created = await request("", "POST", data, 201);
    const id = created.data._id;
    await request("", "POST", data, 409);
    await request("", "POST", { name: "x", email: "invalid" }, 400);
    assert.equal((await request("/" + id)).data.age, 20);
    await request("/" + id, "PUT", { age: 21 });
    await request("/" + id, "PUT", { age: 1 }, 400);
    assert.equal(
      (
        await request(
          "?page=1&limit=1&group_name=BBMO-01-23&course=2&age_min=18&age_max=25&sort=-age",
        )
      ).pagination.total,
      1,
    );
    assert.equal((await request("/search?q=Trofim")).found, 1);
    await request("?page=0", "GET", null, 400);
    await request("?limit=101", "GET", null, 400);
    await request("?sort=unknown", "GET", null, 400);
    await request("/stats");
    assert.match(await request("/export"), /trofim@example.com/);
    await request("/" + id, "DELETE");
    await request("/" + id, "GET", null, 404);
    lines.push("All checks passed against real isolated MongoDB.");
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await client.close();
    await mongo.stop();
    await fs.writeFile("test-results.txt", lines.join("\n"));
  }
  console.log(lines.join("\n"));
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
