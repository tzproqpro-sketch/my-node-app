const fs = require('fs');
const path = require('path');

class FileManager {
  constructor(baseDir = './data') {
    this.baseDir = baseDir;

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  createFile(filename, content, callback) {
    const filePath = path.join(this.baseDir, filename);

    fs.writeFile(filePath, content, 'utf8', (error) => {
      callback(error || null, error ? null : filePath);
    });
  }

  readFile(filename, callback) {
    const filePath = path.join(this.baseDir, filename);

    fs.readFile(filePath, 'utf8', (error, content) => {
      callback(error || null, error ? null : content);
    });
  }

  getFileStats(filename, callback) {
    const filePath = path.join(this.baseDir, filename);

    fs.stat(filePath, (error, stats) => {
      if (error) {
        callback(error, null);
        return;
      }

      callback(null, {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile()
      });
    });
  }

  deleteFile(filename, callback) {
    const filePath = path.join(this.baseDir, filename);

    fs.unlink(filePath, (error) => {
      callback(error || null);
    });
  }

  listFiles(callback) {
    fs.readdir(this.baseDir, (error, files) => {
      if (error) {
        callback(error, null);
        return;
      }

      if (files.length === 0) {
        callback(null, []);
        return;
      }

      const onlyFiles = [];
      let completed = 0;
      let firstError = null;

      files.forEach((file) => {
        const filePath = path.join(this.baseDir, file);

        fs.stat(filePath, (statError, stats) => {
          completed += 1;

          if (statError && !firstError) {
            firstError = statError;
          } else if (!statError && stats.isFile()) {
            onlyFiles.push(file);
          }

          if (completed === files.length) {
            callback(firstError, firstError ? null : onlyFiles);
          }
        });
      });
    });
  }
}

module.exports = FileManager;
