const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const lines = [];
for (const file of ['mysql-connect.js', 'mysql-crud.js', 'mysql-errors.js']) {
  const result = spawnSync(process.execPath, [file], { encoding: 'utf8' });
  lines.push(file, (result.stdout + result.stderr).trimEnd(), 'Exit code: ' + result.status);
  if (result.status !== 0) { process.exitCode = 1; break; }
}
fs.writeFileSync('test-results.txt', lines.join('\n'));
console.log(lines.join('\n'));
