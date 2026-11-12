const { list, User } = require('../services/userService');
async function getAll(ctx) { ctx.body = await list(ctx.query); }
async function getOne(ctx) { const user = await User.findById(ctx.params.id); if (!user) ctx.throw(404, 'User not found'); ctx.body = { data: user }; }
async function create(ctx) { ctx.status = 201; ctx.body = { data: await require('../services/userService').create(ctx.request.body) }; }
async function update(ctx) { const user = await User.update(ctx.params.id, ctx.request.body); if (!user) ctx.throw(404, 'User not found'); ctx.body = { data: user }; }
async function remove(ctx) { if (!await User.delete(ctx.params.id)) ctx.throw(404, 'User not found'); ctx.body = { data: { deleted: true } }; }
module.exports = { getAll, getOne, create, update, remove };
