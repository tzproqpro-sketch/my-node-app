const { Writable } = require('node:stream');
const { once } = require('node:events');
const { finished } = require('node:stream/promises');
async function main() {
  let count = 0;
  const destination = new Writable({ highWaterMark: 16, write(chunk, encoding, callback) {
    console.log('[WRITE]', chunk.toString().trimEnd()); count++;
    setTimeout(callback, 20);
  } });
  const done = finished(destination);
  destination.on('error', error => console.error('[ERROR]', error.message));
  destination.on('drain', () => console.log('[DRAIN] Continue writing'));
  destination.on('finish', () => console.log('[FINISH] Written chunks:', count));
  for (const text of ['Group: 477', 'Student: Zubelik Trofim Alekseevich', 'Laboratory work: 21', 'Topic: Streams']) {
    const ready = destination.write(text + '\n');
    console.log('write() returned:', ready);
    if (!ready) await once(destination, 'drain');
  }
  destination.end(); await done;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
