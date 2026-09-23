async function requireAuthorization(ctx, next) {
  if (!ctx.get('Authorization')) {
    ctx.throw(401, 'Authorization header is required');
  }

  await next();
}

module.exports = requireAuthorization;
