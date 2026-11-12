const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const lines = [];
for (const args of [['events-basic.js'], ['events-once.js'], ['events-class.js'], ['events-class.js', '--unhandled-error']]) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  assert.equal(result.status, args.length === 2 ? 1 : 0, result.stderr);
  lines.push('$ node ' + args.join(' '), result.stdout.trimEnd(), result.stderr.trimEnd(), 'Exit code: ' + result.status);
}
lines.push('All checks passed; unhandled error failed in an isolated child process as expected.');
fs.writeFileSync('test-results.txt', lines.join('\n'));
console.log(lines.join('\n'));
