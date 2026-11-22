const { mysql, config, createPool } = require("./db");
const assert = require("node:assert/strict");
async function expectError(label, code, action) {
  try {
    await action();
    throw new Error("Expected error: " + label);
  } catch (error) {
    if (error.message === "Expected error: " + label) throw error;
    assert.equal(error.code, code, label);
    console.log(label, error.code);
  }
}
async function main() {
  await expectError("Unavailable port", "ECONNREFUSED", async () => {
    const c = await require("mysql2/promise").createConnection({
      ...config,
      port: 1,
    });
    await c.end();
  });
  await expectError("Authentication", "ER_ACCESS_DENIED_ERROR", async () => {
    const c = await require("mysql2/promise").createConnection({
      ...config,
      password: "intentionally-wrong",
    });
    await c.end();
  });
  let pool = createPool();
  const db = pool.promise();
  try {
    await expectError("Syntax", "ER_PARSE_ERROR", () => db.query("SELECT * FRM students"));
    const connection = await db.getConnection();
    try {
      await connection.query(
        "CREATE TEMPORARY TABLE error_demo (id INT PRIMARY KEY, name VARCHAR(40) NOT NULL)",
      );
      await connection.execute("INSERT INTO error_demo VALUES (?, ?)", [
        1,
        "Trofim",
      ]);
      await expectError("Duplicate", "ER_DUP_ENTRY", () =>
        connection.execute("INSERT INTO error_demo VALUES (?, ?)", [1, "Anna"]),
      );
      await expectError("Not null", "ER_BAD_NULL_ERROR", () =>
        connection.execute("INSERT INTO error_demo VALUES (?, ?)", [2, null]),
      );
      const suffix = require("node:crypto").randomUUID().replaceAll("-", "");
      const parentTable = "fk_parent_" + suffix;
      const childTable = "fk_child_" + suffix;
      // Dedicated tables are needed: MySQL temporary tables do not support foreign keys.
      try {
        await connection.query("CREATE TABLE " + parentTable + " (id INT PRIMARY KEY) ENGINE=InnoDB");
        await connection.query("CREATE TABLE " + childTable + " (parent_id INT, FOREIGN KEY (parent_id) REFERENCES " + parentTable + "(id)) ENGINE=InnoDB");
        await expectError("Foreign key", "ER_NO_REFERENCED_ROW_2", () =>
          connection.execute("INSERT INTO " + childTable + " (parent_id) VALUES (?)", [999]),
        );
      } finally {
        await connection.query("DROP TABLE IF EXISTS " + childTable);
        await connection.query("DROP TABLE IF EXISTS " + parentTable);
      }
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
      } catch (error) {
        assert.equal(error.code, "ER_DUP_ENTRY");
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
      if (global.gc) global.gc();
      const baseline = process.memoryUsage().heapUsed;
      let [rows] = await connection.query("SELECT * FROM big_data");
      if (global.gc) global.gc();
      console.log(
        "Buffered rows:",
        rows.length,
        "heap delta:",
        process.memoryUsage().heapUsed - baseline,
      );
      assert.equal(rows.length, 100000);
      rows = null;
      if (global.gc) global.gc();
      const streamBaseline = process.memoryUsage().heapUsed;
      const started = performance.now();
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
      if (global.gc) global.gc();
      console.log("Stream rows:", count, "heap delta:", process.memoryUsage().heapUsed - streamBaseline, "sampled peak heap bytes:", peak, "elapsed ms:", Math.round(performance.now() - started));
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
    const other = await recovered.getConnection();
    try {
      await other.query("KILL CONNECTION " + Number(id));
    } finally {
      other.release();
      connection.release();
    }
    const error = await failed;
    assert.equal(error.code, "PROTOCOL_CONNECTION_LOST");
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
