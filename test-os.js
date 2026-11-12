const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { maskMac } = require('./os-network');
const { memoryStatus } = require('./os-resources');
assert.equal(maskMac('aa:bb:cc:dd:ee:ff'), 'aa:bb:cc:**:**:**');
assert.match(memoryStatus(19, 100), /WARNING/);
assert.equal(memoryStatus(20, 100), 'Memory is OK');
const results = ['OS module tasks 1-3'];
for (const file of ['os-info.js', 'os-resources.js', 'os-network.js']) {
  const output = execFileSync(process.execPath, [file], { encoding: 'utf8' });
  assert.match(output, /477/);
  results.push('$ node ' + file, output.trimEnd());
}
results.push('Simulated low-memory boundary test:', memoryStatus(19, 100), 'All checks passed.');
fs.writeFileSync('test-results.txt', results.join('\n'));
console.log(results.join('\n'));
