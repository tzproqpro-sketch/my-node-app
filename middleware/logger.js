function requestLogger() {
  return async (ctx, next) => {
    const startedAt = new Date();
    const startTime = Date.now();

    try {
      await next();
    } finally {
      const finishedAt = new Date();
      const elapsed = Date.now() - startTime;
      const startStamp = startedAt.toISOString().replace('T', ' ').slice(0, 19);
      const finishStamp = finishedAt.toISOString().replace('T', ' ').slice(0, 19);
      console.log(`[${startStamp}] ${ctx.method} ${ctx.path} - ${elapsed}ms (finished ${finishStamp})`);
    }
  };
}

module.exports = requestLogger;
