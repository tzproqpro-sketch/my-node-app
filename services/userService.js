const { User } = require('../models/user');
const Joi = require('joi');
const querySchema = Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(10), sort: Joi.string().valid('name', '-name', 'age', '-age', 'created_at', '-created_at'), group_name: Joi.string().pattern(/^(?:BBMO|ББМО)-\d{2}-\d{2}$/), course: Joi.number().integer().min(1).max(4), age_min: Joi.number().integer().min(16).max(100), age_max: Joi.number().integer().min(16).max(100), search: Joi.string().max(100), q: Joi.string().max(100) });
async function list(query) {
  const { error, value } = querySchema.validate(query);
  if (error || (value.age_min && value.age_max && value.age_min > value.age_max)) { const failure = new Error('Invalid query parameters'); failure.status = 400; throw failure; }
  const filter = {};
  if (value.group_name) filter.group_name = value.group_name;
  if (value.course) filter.course = value.course;
  if (value.age_min || value.age_max) filter.age = { ...(value.age_min ? { $gte: value.age_min } : {}), ...(value.age_max ? { $lte: value.age_max } : {}) };
  const search = value.search || value.q;
  if (search) filter.$text = { $search: search };
  const field = (value.sort || 'name').replace(/^-/, '');
  const sort = search && !value.sort ? { score: { $meta: 'textScore' } } : { [field]: value.sort?.startsWith('-') ? -1 : 1, _id: 1 };
  const total = await User.collection().countDocuments(filter);
  const data = await User.collection().find(filter, search ? { projection: { score: { $meta: 'textScore' } } } : {}).sort(sort).skip((value.page - 1) * value.limit).limit(value.limit).toArray();
  return { data, pagination: { total, page: value.page, limit: value.limit, pages: Math.ceil(total / value.limit) } };
}
async function create(data) {
  console.log('[SERVICE] Create user');
  if (await User.findByEmail(data.email)) { const error = new Error('Email already exists'); error.status = 409; throw error; }
  const user = await User.create(data);
  console.log('[SERVICE] Simulated notification for', user.email);
  return user;
}
async function stats() { return (await User.collection().aggregate([{ $facet: { summary: [{ $group: { _id: null, total: { $sum: 1 }, averageAge: { $avg: '$age' } } }], byGroup: [{ $group: { _id: '$group_name', count: { $sum: 1 } } }], byCourse: [{ $group: { _id: '$course', count: { $sum: 1 } } }] } }]).toArray())[0]; }
module.exports = { list, create, stats, User };
