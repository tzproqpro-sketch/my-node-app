require("dotenv").config({ quiet: true });
const Koa = require("koa");
const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const controller = require("./controllers/userController");
const service = require("./services/userService");
const { connect } = require("./db");
const { User } = require("./models/user");
async function createApp(db) {
  await User.initialize(db);
  const app = new Koa();
  app.use(async (ctx, next) => {
    ctx.set("X-Group", "BBMO-01-23");
    const started = Date.now();
    try {
      await next();
    } catch (error) {
      ctx.status = error.code === 11000 ? 409 : error.status || 500;
      ctx.body = {
        error: ctx.status === 500 ? "Internal server error" : error.message,
        status: ctx.status,
        ...(error.details ? { details: error.details } : {}),
      };
    } finally {
      console.log(ctx.method, ctx.path, ctx.status, Date.now() - started, "ms");
    }
  });
  app.use(async (ctx, next) => {
    ctx.db = db;
    await next();
  });
  app.use(bodyParser());
  const router = new Router({ prefix: "/api/users" });
  router.get("/search", async (ctx) => {
    const result = await service.list(ctx.query);
    ctx.body = { ...result, found: result.pagination.total };
  });
  router.get("/stats", async (ctx) => {
    ctx.body = { data: await service.stats() };
  });
  router.get("/export", async (ctx) => {
    ctx.type = "text/csv";
    const { Readable } = require("node:stream");
    const cursor = User.collection().find();
    ctx.body = Readable.from(
      (async function* () {
        yield "name,email,group_name,age,course\r\n";
        try {
          for await (const user of cursor)
            yield (
              ["name", "email", "group_name", "age", "course"]
                .map(
                  (key) =>
                    '"' + String(user[key] ?? "").replaceAll('"', '""') + '"',
                )
                .join(",") + "\r\n"
            );
        } finally {
          await cursor.close();
        }
      })(),
    );
  });
  router
    .get("/", controller.getAll)
    .get("/:id", controller.getOne)
    .post("/", controller.create)
    .put("/:id", controller.update)
    .delete("/:id", controller.remove);
  app.use(router.routes()).use(router.allowedMethods());
  app.use((ctx) => {
    ctx.status = 404;
    ctx.body = { error: "Not found", status: 404 };
  });
  return app;
}
if (require.main === module)
  connect()
    .then(async ({ db, client }) => {
      const app = await createApp(db);
      const server = app.listen(3000, () =>
        console.log("MongoDB connected; Koa listening on port 3000"),
      );
      function stop() {
        server.close(() => client.close());
      }
      process.on("SIGINT", stop);
      process.on("SIGTERM", stop);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
module.exports = { createApp };
