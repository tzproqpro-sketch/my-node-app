const fs = require('fs');
const path = require('path');
const FileManager = require('./fileOperations');

const baseDir = path.join(__dirname, 'test-data-callbacks');
const fileManager = new FileManager(baseDir);

function removeIfExists(filename, callback) {
  fileManager.deleteFile(filename, (error) => {
    if (error && error.code !== 'ENOENT') {
      callback(error);
      return;
    }
    callback(null);
  });
}

console.log('=== CALLBACK FILE OPERATIONS ===');

fileManager.createFile('test1.txt', 'Hello from callbacks!', (error, filePath) => {
  if (error) {
    console.error('Create error:', error.message);
    process.exitCode = 1;
    return;
  }
  console.log('1. Created:', filePath);

  fileManager.readFile('test1.txt', (readError, content) => {
    if (readError) {
      console.error('Read error:', readError.message);
      process.exitCode = 1;
      return;
    }
    console.log('2. Read:', content);

    fileManager.getFileStats('test1.txt', (statsError, stats) => {
      if (statsError) {
        console.error('Stats error:', statsError.message);
        process.exitCode = 1;
        return;
      }
      console.log('3. Size:', stats.size, 'bytes');

      fileManager.createFile('test2.txt', 'Second callback file', (secondError) => {
        if (secondError) {
          console.error('Second create error:', secondError.message);
          process.exitCode = 1;
          return;
        }

        fileManager.listFiles((listError, files) => {
          if (listError) {
            console.error('List error:', listError.message);
            process.exitCode = 1;
            return;
          }
          console.log('4. Files:', files.join(', '));

          removeIfExists('test1.txt', (removeFirstError) => {
            if (removeFirstError) {
              console.error('Delete error:', removeFirstError.message);
              process.exitCode = 1;
              return;
            }

            removeIfExists('test2.txt', (removeSecondError) => {
              if (removeSecondError) {
                console.error('Delete error:', removeSecondError.message);
                process.exitCode = 1;
                return;
              }

              fs.rm(baseDir, { recursive: true, force: true }, (cleanupError) => {
                if (cleanupError) {
                  console.error('Cleanup error:', cleanupError.message);
                  process.exitCode = 1;
                  return;
                }
                console.log('5. Callback operations completed.');
              });
            });
          });
        });
      });
    });
  });
});
