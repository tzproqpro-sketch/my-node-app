require('dotenv').config({ quiet: true });
const { MongoClient } = require('mongodb');
function client() { return new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 3000, heartbeatFrequencyMS: 500 }); }
async function withDb(action) {
  const connection = client();
  try { await connection.connect(); await action(connection.db(process.env.DB_NAME || 'lab23_477'), connection); }
  finally { await connection.close(); }
}
module.exports = { client, withDb };
