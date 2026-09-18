const fs = require('fs/promises');
const path = require('path');
const FileManagerPromises = require('./fileOperationsPromises');

async function testFileOperations() {
  const baseDir = path.join(__dirname, 'test-data-promises');
  const fileManager = new FileManagerPromises(baseDir);

  console.log('=== PROMISE FILE OPERATIONS ===');

  try {
    const firstPath = await fileManager.createFile(
      'test1.txt',
      'Hello from promises!'
    );
    console.log('1. Created:', firstPath);

    console.log('2. Read:', await fileManager.readFile('test1.txt'));

    const stats = await fileManager.getFileStats('test1.txt');
    console.log('3. Size:', stats.size, 'bytes');

    const paths = await fileManager.createMultipleFiles([
      { filename: 'test2.txt', content: 'Second promise file' },
      { filename: 'test3.txt', content: 'Third promise file' },
      { filename: 'test4.txt', content: 'Fourth promise file' }
    ]);
    console.log('4. Created in parallel:', paths.length);

    const files = await fileManager.listFiles();
    console.log('5. Files:', files.join(', '));

    const contents = await fileManager.readMultipleFiles(files);
    console.log('6. Read in parallel:', Object.keys(contents).length);

    await Promise.all(files.map((file) => fileManager.deleteFile(file)));
    await fs.rm(baseDir, { recursive: true, force: true });
    console.log('7. Promise operations completed.');
  } catch (error) {
    console.error('Promise error:', error.message);
    process.exitCode = 1;
  }
}

testFileOperations();
