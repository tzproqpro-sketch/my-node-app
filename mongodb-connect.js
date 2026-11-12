const { client } = require('./db');
async function main() {
  const connection = client();
  connection.on('serverHeartbeatSucceeded', () => console.log('[HEARTBEAT] Success', new Date().toISOString()));
  connection.on('serverHeartbeatFailed', event => console.log('[HEARTBEAT] Failed:', event.failure.message));
  try {
    await connection.connect();
    const db = connection.db(process.env.DB_NAME || 'lab23_477');
    console.log('Ping:', await db.command({ ping: 1 }));
    console.log('Version:', (await db.command({ buildInfo: 1 })).version);
    console.log('Databases:', await connection.db('admin').admin().listDatabases());
    console.log('Collections:', await db.listCollections().toArray());
    await new Promise(resolve => setTimeout(resolve, 1600));
  } finally { await connection.close(); console.log('Client closed'); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
