async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (error) {
    const status = error.status || 500;
    ctx.status = status;
    ctx.type = 'application/json';
    ctx.body = {
      error: status >= 500 ? 'Internal server error' : error.message,
      status
    };

    if (status >= 500) {
      console.error(`[error] ${error.stack || error.message}`);
    }
  }
}

module.exports = errorHandler;
