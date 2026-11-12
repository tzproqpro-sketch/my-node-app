const { Readable } = require('node:stream');
class StudentStream extends Readable {
  constructor() {
    super();
    this.lines = ['Group: 477', 'Student: Zubelik Trofim Alekseevich', 'Laboratory work: 21', 'Topic: Streams in Node.js'];
  }
  _read() { this.push(this.lines.length ? this.lines.shift() + '\n' : null); }
}
const source = new StudentStream();
let chunks = 0;
let bytes = 0;
source.on('data', chunk => { chunks++; bytes += chunk.length; console.log('[CHUNK ' + chunks + ']', chunk.toString().trimEnd()); });
source.on('end', () => console.log('[END] Chunks:', chunks, 'Bytes:', bytes));
source.on('error', error => { console.error(error); process.exitCode = 1; });
