const { withDb } = require('./db');
const assert = require('node:assert/strict');
withDb(async db => {
  const students = db.collection('students');
  const demo = 'crud-' + Date.now();
  const make = (name, grade) => ({ name, grade, group_name: '477', course: 2, created_at: new Date(), demo });
  await students.createIndex({ group_name: 1 });
  try {
    const one = await students.insertOne(make('Trofim', 4.5)); console.log('insertOne:', one.insertedId);
    console.log('insertMany:', (await students.insertMany([make('Anna', 3.8), make('Ivan', 2.5)])).insertedIds);
    console.log('All demo documents:', await students.find({ demo }).toArray());
    console.log('Filter/sort/page:', await students.find({ demo, group_name: '477' }).sort({ grade: -1 }).skip(0).limit(10).toArray());
    console.log('findOne:', await students.findOne({ _id: one.insertedId }));
    console.log('Projection:', await students.find({ demo }, { projection: { name: 1, grade: 1, _id: 0 } }).toArray());
    console.log('updateOne:', await students.updateOne({ _id: one.insertedId }, { $set: { grade: 4.8, temporary: true }, $push: { tags: 'updated' } }));
    console.log('updateMany:', await students.updateMany({ demo }, { $inc: { course: 1 }, $unset: { temporary: '' } }));
    assert.equal((await students.findOne({ _id: one.insertedId })).course, 3);
    console.log('deleteOne:', await students.deleteOne({ _id: one.insertedId }));
    console.log('deleteMany:', await students.deleteMany({ demo, grade: { $lt: 3 } }));
  } finally { await students.deleteMany({ demo }); }
}).catch(error => { console.error(error); process.exitCode = 1; });
