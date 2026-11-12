const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'lab24_477';
async function connect() { const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 }); await client.connect(); return { client, db: client.db(dbName) }; }
module.exports = { connect };
