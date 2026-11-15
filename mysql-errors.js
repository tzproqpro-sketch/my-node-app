const { mysql, config, createPool } = require("./db");
const assert = require("node:assert/strict");
async function expectError(label, action) {
  try {
    await action();
    throw new Error("Expected error: " + label);
  } catch (error) {
    if (error.message === "Expected error: " + label) throw error;
    console.log(label, error.code);
  }
}
async function main() {
  await expectError("Unavailable port", async () => {
    const c = await require("mysql2/promise").createConnection({
      ...config,
      port: 1,
    });
    await c.end();
  });
  await expectError("Authentication", async () => {
    const c = await require("mysql2/promise").createConnection({
      ...config,
      password: "intentionally-wrong",
    });
    await c.end();
  });
  let pool = createPool();
  const db = pool.promise();
  try {
    await expectError("Syntax", () => db.query("SELECT * FRM students"));
    const connection = await db.getConnection();
    try {
      await connection.query(
        "CREATE TEMPORARY TABLE error_demo (id INT PRIMARY KEY, name VARCHAR(40) NOT NULL)",
      );
      await connection.execute("INSERT INTO error_demo VALUES (?, ?)", [
        1,
        "Trofim",
      ]);
      await expectError("Duplicate", () =>
        connection.execute("INSERT INTO error_demo VALUES (?, ?)", [1, "Anna"]),
      );
      await expectError("Not null", () =>
        connection.execute("INSERT INTO error_demo VALUES (?, ?)", [2, null]),
      );
      await connection.beginTransaction();
      await connection.execute("INSERT INTO error_demo VALUES (?, ?)", [
        3,
        "Commit",
      ]);
      await connection.commit();
      assert.equal((await connection.query("SELECT * FROM error_demo WHERE id = 3"))[0].length, 1);
      console.log("Transaction committed; inserted row verified");
      await connection.beginTransaction();
      try {
        await connection.execute("INSERT INTO error_demo VALUES (?, ?)", [
          4,
          "Rollback",
        ]);
        await connection.execute("INSERT INTO error_demo VALUES (?, ?)", [
          1,
          "Duplicate",
        ]);
        await connection.commit();
      } catch {
        await connection.rollback();
        console.log("Transaction rolled back after duplicate key");
      }
      assert.equal(
        (await connection.query("SELECT * FROM error_demo WHERE id = 4"))[0]
          .length,
        0,
      );
      await connection.query(
        "CREATE TEMPORARY TABLE big_data (id INT PRIMARY KEY, value VARCHAR(100))",
      );
      for (let start = 0; start < 100000; start += 1000) {
        await connection.query("INSERT INTO big_data VALUES ?", [
          Array.from({ length: 1000 }, (_, index) => [
            start + index,
            "Group 477 record " + (start + index),
          ]),
        ]);
      }
      const baseline = process.memoryUsage().heapUsed;
      const [rows] = await connection.query("SELECT * FROM big_data");
      console.log(
        "Buffered rows:",
        rows.length,
        "heap delta:",
        process.memoryUsage().heapUsed - baseline,
      );
      rows.length = 0;
      let count = 0;
      let peak = process.memoryUsage().heapUsed;
      await new Promise((resolve, reject) => {
        const stream = connection.connection
          .query("SELECT * FROM big_data")
          .stream({ highWaterMark: 16 });
        stream.on("data", () => {
          count++;
          peak = Math.max(peak, process.memoryUsage().heapUsed);
          if (count % 10000 === 0) console.log("[STREAM]", count);
        });
        stream.on("error", reject);
        stream.on("end", resolve);
      });
      assert.equal(count, 100000);
      console.log("Stream rows:", count, "peak heap bytes:", peak);
    } finally {
      connection.release();
    }
  } finally {
    await db.end();
    console.log("Connection released; pool closed");
  }
  pool = createPool();
  const recovered = pool.promise();
  try {
    const connection = await recovered.getConnection();
    const id = connection.threadId;
    const failed = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Expected connection loss")), 3000);
      pool.once("error", (error) => { clearTimeout(timeout); resolve(error); });
    });
    connection.release();
    const killer = await recovered.getConnection();
    // Keep the first connection busy so a different one sends KILL.
    const other = await recovered.getConnection();
    await other.query("KILL CONNECTION " + id);
    other.release();
    killer.release();
    const error = await failed;
    console.log("Lost connection forwarded to pool:", error.code);
  } finally {
    await recovered.end();
  }
  console.log("Recreating pool after connection loss");
  pool = createPool();
  try {
    await pool.promise().query("SELECT 1");
    console.log("New pool query succeeded");
  } finally {
    await pool.promise().end();
  }
}
main().catch((error) => {
  console.error(error.code, error.message);
  process.exitCode = 1;
});
