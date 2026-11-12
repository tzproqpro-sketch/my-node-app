const { mysql, config, createPool } = require('./db');
async function main() {
  let connection;
  try {
    connection = await mysql.createConnection(config).promise();
    console.log('Single connection:', (await connection.query('SELECT VERSION() AS version, DATABASE() AS db, CURRENT_USER() AS user'))[0]);
  } finally { if (connection) await connection.end(); }
  const pool = createPool().promise();
  try { console.log('Pool (limit 10):', (await pool.query('SELECT VERSION() AS version, DATABASE() AS db, CURRENT_USER() AS user'))[0]); }
  finally { await pool.end(); }
}
main().catch(error => { console.error(error.code, error.message); process.exitCode = 1; });
