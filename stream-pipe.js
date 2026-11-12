const fs = require('node:fs');
const fsp = require('node:fs/promises');
const { Transform } = require('node:stream');
const { pipeline, finished } = require('node:stream/promises');
const assert = require('node:assert/strict');
async function main() {
  await fsp.writeFile('input.txt', 'Group 477\nStudent: Zubelik Trofim Alekseevich\nLaboratory work 21\n');
  const source = fs.createReadStream('input.txt');
  const destination = fs.createWriteStream('output-pipe.txt');
  const done = finished(destination);
  source.on('error', error => destination.destroy(error));
  source.pipe(destination); await done;
  console.log('pipe(): copy completed');
  const missing = fs.createReadStream('missing.txt');
  const openDestination = fs.createWriteStream('output-error.txt');
  const closed = new Promise(resolve => openDestination.once('close', resolve));
  await new Promise(resolve => {
    missing.once('error', error => {
      console.log('pipe() error:', error.code, 'destination destroyed:', openDestination.destroyed);
      assert.equal(openDestination.destroyed, false);
      openDestination.destroy(); resolve();
    });
    missing.pipe(openDestination);
  });
  await closed;
  await pipeline(fs.createReadStream('input.txt'), fs.createWriteStream('output-pipeline.txt'));
  console.log('pipeline(): copy completed');
  const missingSource = fs.createReadStream('missing.txt');
  const cleanedDestination = fs.createWriteStream('output-pipeline-error.txt');
  try { await pipeline(missingSource, cleanedDestination); }
  catch (error) {
    assert.equal(error.code, 'ENOENT');
    assert.equal(missingSource.destroyed && cleanedDestination.destroyed, true);
    console.log('pipeline() error:', error.code, 'all streams destroyed:', true);
  }
  const uppercase = new Transform({ transform(chunk, encoding, callback) { callback(null, chunk.toString().toUpperCase()); } });
  const reverse = new Transform({ transform(chunk, encoding, callback) { callback(null, chunk.toString().split('').reverse().join('')); } });
  await pipeline(fs.createReadStream('input.txt'), uppercase, reverse, fs.createWriteStream('output-chain.txt'));
  assert.equal(await fsp.readFile('input.txt', 'utf8'), await fsp.readFile('output-pipeline.txt', 'utf8'));
  assert.equal(await fsp.readFile('input.txt', 'utf8'), await fsp.readFile('output-pipe.txt', 'utf8'));
  console.log('Copies match; uppercase/reverse chain output:', await fsp.readFile('output-chain.txt', 'utf8'));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
