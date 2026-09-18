const FileManager = require('./fileOperations');
const FileManagerPromises = require('./fileOperationsPromises');

class FileManagerHybrid {
  constructor(baseDir = './data-hybrid') {
    this.callbacks = new FileManager(baseDir);
    this.promises = new FileManagerPromises(baseDir);
  }

  withCallback(promise, callback, emptyValue = null) {
    if (typeof callback !== 'function') {
      return promise;
    }

    return promise.then(
      (value) => {
        callback(null, value);
        return value;
      },
      (error) => {
        callback(error, emptyValue);
        return undefined;
      }
    );
  }

  createFile(filename, content, callback) {
    return this.withCallback(
      this.promises.createFile(filename, content),
      callback
    );
  }

  readFile(filename, callback) {
    return this.withCallback(this.promises.readFile(filename), callback);
  }

  getFileStats(filename, callback) {
    return this.withCallback(this.promises.getFileStats(filename), callback);
  }

  deleteFile(filename, callback) {
    const promise = this.promises.deleteFile(filename);
    return this.withCallback(promise, callback, undefined);
  }

  listFiles(callback) {
    return this.withCallback(this.promises.listFiles(), callback);
  }

  createFileWithCallback(filename, content, callback) {
    this.callbacks.createFile(filename, content, callback);
  }

  readFileWithCallback(filename, callback) {
    this.callbacks.readFile(filename, callback);
  }

  getFileStatsWithCallback(filename, callback) {
    this.callbacks.getFileStats(filename, callback);
  }

  deleteFileWithCallback(filename, callback) {
    this.callbacks.deleteFile(filename, callback);
  }

  listFilesWithCallback(callback) {
    this.callbacks.listFiles(callback);
  }
}

module.exports = FileManagerHybrid;
