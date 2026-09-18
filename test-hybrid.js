const fs = require('fs/promises');
const path = require('path');
const FileManagerHybrid = require('./fileOperationsHybrid');

async function runHybridTest() {
  const baseDir = path.join(__dirname, 'test-data-hybrid');
  const fileManager = new FileManagerHybrid(baseDir);

  console.log('=== HYBRID FILE OPERATIONS ===');

  await new Promise((resolve, reject) => {
    fileManager.createFileWithCallback(
      'callback.txt',
      'Created with callback',
      (error, filePath) => {
        if (error) {
          reject(error);
          return;
        }
        console.log('1. Callback create:', filePath);
        resolve();
      }
    );
  });

  console.log('2. Promise read:', await fileManager.readFile('callback.txt'));

  await new Promise((resolve, reject) => {
    fileManager.getFileStatsWithCallback('callback.txt', (error, stats) => {
      if (error) {
        reject(error);
        return;
      }
      console.log('3. Callback stats:', stats.size, 'bytes');
      resolve();
    });
  });

  await fileManager.createFile('promise.txt', 'Created with promise');
  console.log('4. Promise list:', (await fileManager.listFiles()).join(', '));

  await new Promise((resolve, reject) => {
    fileManager.deleteFileWithCallback('promise.txt', (error) => {
      if (error) {
        reject(error);
        return;
      }
      console.log('5. Callback delete completed.');
      resolve();
    });
  });

  await new Promise((resolve) => {
    fileManager.readFile('missing.txt', (error) => {
      console.log('6. Callback error handled:', error.code);
      resolve();
    });
  });

  await fileManager.deleteFile('callback.txt');
  await fs.rm(baseDir, { recursive: true, force: true });
  console.log('7. Hybrid operations completed.');
}

runHybridTest().catch((error) => {
  console.error('Hybrid error:', error.message);
  process.exitCode = 1;
});
