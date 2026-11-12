const { ObjectId } = require('mongodb');
const Joi = require('joi');
const schema = Joi.object({ name: Joi.string().trim().min(2).max(100).required(), email: Joi.string().email().lowercase().required(), group_name: Joi.string().pattern(/^(?:BBMO|ББМО)-\d{2}-\d{2}$/).required(), age: Joi.number().integer().min(16).max(100).required(), course: Joi.number().integer().min(1).max(4) });
let collection;
function validate(data, partial = false) {
  const rules = partial ? schema.fork(['name', 'email', 'group_name', 'age'], rule => rule.optional()).min(1) : schema;
  const result = rules.validate(data, { abortEarly: false });
  if (result.error) { const error = new Error('Validation failed'); error.status = 400; error.details = result.error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message })); throw error; }
  return result.value;
}
class User {
  static async initialize(db) { collection = db.collection('users'); await collection.createIndex({ email: 1 }, { unique: true }); await collection.createIndex({ name: 'text', email: 'text' }); }
  static collection() { return collection; }
  static async findAll(filter = {}) { return collection.find(filter).toArray(); }
  static async findById(id) { return ObjectId.isValid(id) ? collection.findOne({ _id: new ObjectId(id) }) : null; }
  static async findByEmail(email) { return collection.findOne({ email }); }
  static async create(data) { const value = { ...validate(data), created_at: new Date() }; const result = await collection.insertOne(value); return { ...value, _id: result.insertedId }; }
  static async update(id, data) { const value = validate(data, true); if (!ObjectId.isValid(id)) return null; return collection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: value }, { returnDocument: 'after' }); }
  static async delete(id) { return ObjectId.isValid(id) && (await collection.deleteOne({ _id: new ObjectId(id) })).deletedCount === 1; }
}
module.exports = { User, validate };
