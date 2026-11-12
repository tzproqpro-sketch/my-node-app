const { EventEmitter } = require('node:events');
class DatabaseConnection extends EventEmitter {
  constructor() { super(); this.connected = false; }
  connect() { this.connected = true; this.emit('connect', 'Group 477: connected to simulated database'); }
  query(sql) {
    if (!this.connected) return this.error(new Error('Connection is closed'));
    const result = sql === 'SELECT * FROM students' ? [{ name: 'Trofim', group: '477' }] : [];
    this.emit('query', sql, result);
    return result;
  }
  close() { this.connected = false; this.emit('close', 'Group 477: connection closed'); }
  error(error) { this.emit('error', error); }
}
if (require.main === module) {
  const db = new DatabaseConnection();
  if (process.argv.includes('--unhandled-error')) {
    db.error(new Error('Demonstration: no error listener'));
  } else {
    db.on('connect', message => console.log('[connect]', message));
    db.on('query', (sql, result) => console.log('[query] Group 477:', sql, JSON.stringify(result)));
    db.on('close', message => console.log('[close]', message));
    db.on('error', error => console.log('[error] Group 477:', error.message));
    db.connect(); db.query('SELECT * FROM students'); db.close(); db.query('SELECT * FROM students');
    db.error(new Error('Connection timeout'));
  }
}
module.exports = { DatabaseConnection };
