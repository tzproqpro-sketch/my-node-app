const { createPool, schema } = require('./db');
const assert = require('node:assert/strict');
async function main() {
  const pool = createPool().promise();
  let connection;
  try {
    await pool.query(schema);
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [inserted] = await connection.execute('INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?)', ['Trofim', '477', 2, 4.5]);
    console.log('INSERT:', inserted.insertId, inserted.affectedRows);
    await connection.execute('INSERT INTO students (name, group_name, course, grade) VALUES (?, ?, ?, ?), (?, ?, ?, ?)', ['Anna', '477', 1, 3.8, 'Ivan', '477', 3, 4.2]);
    console.log('All:', (await connection.query('SELECT * FROM students'))[0]);
    console.log('Filtered and sorted:', (await connection.execute('SELECT * FROM students WHERE group_name = ? ORDER BY grade DESC LIMIT ? OFFSET ?', ['477', 10, 0]))[0]);
    for (let i = 0; i < 2; i++) console.log('UPDATE:', (await connection.execute('UPDATE students SET grade = ? WHERE id = ?', [4.8, inserted.insertId]))[0]);
    const input = "Trofim' OR '1'='1";
    console.log('Unsafe concatenation (not executed):', "SELECT * FROM students WHERE name = '" + input + "'");
    assert.equal((await connection.execute('SELECT * FROM students WHERE name = ?', [input]))[0].length, 0);
    console.log('Parameterized lookup treated the entire input as a value.');
    console.log('DELETE:', (await connection.execute('DELETE FROM students WHERE id = ?', [inserted.insertId]))[0].affectedRows);
    console.log('Delete group within transaction:', (await connection.execute('DELETE FROM students WHERE group_name = ?', ['477']))[0].affectedRows);
    await connection.rollback();
    console.log('Demo changes rolled back. Existing rows preserved.');
  } finally { if (connection) { await connection.rollback(); connection.release(); } await pool.end(); }
}
main().catch(error => { console.error(error.code, error.message); process.exitCode = 1; });
