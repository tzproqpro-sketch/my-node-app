const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { PORT } = require('./config');
const errorHandler = require('./middleware/error-handler');
const requestLogger = require('./middleware/logger');
const requireAuthorization = require('./middleware/auth');
const { router } = require('./routes');

function createApp() {
  const app = new Koa();

  app.use(errorHandler);
  app.use(requestLogger());
  app.use(bodyParser());
  app.use(async (ctx, next) => {
    if (ctx.path === '/protected') return requireAuthorization(ctx, next);
    await next();
  });
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.use((ctx) => {
    ctx.status = 404;
    ctx.body = { error: 'Route not found', status: 404 };
  });

  return app;
}

if (require.main === module) {
  createApp().listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = { createApp };
