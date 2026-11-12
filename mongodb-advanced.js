const { withDb } = require("./db");
const assert = require("node:assert/strict");
withDb(async (db) => {
  const name = "advanced_" + Date.now();
  const records = db.collection(name);
  const groups = db.collection(name + "_groups");
  try {
    await groups.insertMany([
      { group_name: "477", curator: "Ivan Petrov" },
      { group_name: "478", curator: "Anna Orlova" },
    ]);
    for (let start = 0; start < 1000000; start += 1000) {
      await records.insertMany(
        Array.from({ length: 1000 }, (_, index) => {
          const id = start + index;
          return {
            name: id % 2 ? "Anna Ivanova" : "Ivan Petrov",
            group_name: id % 2 ? "477" : "478",
            course: (id % 4) + 1,
            grade: 3 + (id % 20) / 10,
            email: "student" + id + "@example.com",
          };
        }),
      );
    }
    let count = 0;
    let peak = process.memoryUsage().heapUsed;
    const cursor = records.find().batchSize(1000);
    try {
      for await (const doc of cursor) {
        count++;
        peak = Math.max(peak, process.memoryUsage().heapUsed);
      }
    } finally {
      await cursor.close();
    }
    assert.equal(count, 1000000);
    console.log("Cursor count:", count, "peak heap:", peak);
    const nextCursor = records.find().limit(1);
    try {
      console.log("next():", await nextCursor.next());
    } finally {
      await nextCursor.close();
    }
    const before = process.memoryUsage().heapUsed;
    const all = await records.find().toArray();
    console.log(
      "toArray count:",
      all.length,
      "heap delta:",
      process.memoryUsage().heapUsed - before,
    );
    all.length = 0;
    console.log(
      "Average grades:",
      await records
        .aggregate([
          { $group: { _id: "$group_name", average: { $avg: "$grade" } } },
        ])
        .toArray(),
    );
    console.log(
      "By course:",
      await records
        .aggregate([{ $group: { _id: "$course", count: { $sum: 1 } } }])
        .toArray(),
    );
    console.log(
      "Top 10:",
      await records
        .aggregate([
          { $sort: { grade: -1 } },
          { $limit: 10 },
          { $project: { name: 1, grade: 1 } },
        ])
        .toArray(),
    );
    console.log(
      "Join:",
      await groups
        .aggregate([
          {
            $lookup: {
              from: name,
              localField: "group_name",
              foreignField: "group_name",
              pipeline: [{ $count: "count" }],
              as: "students",
            },
          },
        ])
        .toArray(),
    );
    console.log(
      "Without index:",
      (
        await records
          .find({ email: "student1@example.com" })
          .explain("executionStats")
      ).executionStats,
    );
    await records.createIndex({ group_name: 1 });
    await records.createIndex({ group_name: 1, grade: -1 });
    await records.createIndex({ email: 1 }, { unique: true });
    console.log(
      "With index:",
      (
        await records
          .find({ email: "student1@example.com" })
          .explain("executionStats")
      ).executionStats,
    );
    await records.createIndex({ name: "text" });
    console.log(
      "Text search:",
      await records
        .find(
          { $text: { $search: "Ivan" } },
          { projection: { name: 1, score: { $meta: "textScore" } } },
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(5)
        .toArray(),
    );
  } finally {
    await records.drop().catch(() => {});
    await groups.drop().catch(() => {});
  }
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
