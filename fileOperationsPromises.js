const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

class FileManagerPromises {
  constructor(baseDir = './data-promises') {
    this.baseDir = baseDir;

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async createFile(filename, content) {
    const filePath = path.join(this.baseDir, filename);
    await writeFile(filePath, content, 'utf8');
    return filePath;
  }

  async readFile(filename) {
    return readFile(path.join(this.baseDir, filename), 'utf8');
  }

  async getFileStats(filename) {
    const stats = await stat(path.join(this.baseDir, filename));

    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile()
    };
  }

  async deleteFile(filename) {
    await unlink(path.join(this.baseDir, filename));
  }

  async listFiles() {
    const files = await readdir(this.baseDir);
    const fileStats = await Promise.all(
      files.map(async (file) => ({
        name: file,
        isFile: (await stat(path.join(this.baseDir, file))).isFile()
      }))
    );

    return fileStats.filter((file) => file.isFile).map((file) => file.name);
  }

  async createMultipleFiles(files) {
    return Promise.all(
      files.map(({ filename, content }) => this.createFile(filename, content))
    );
  }

  async readMultipleFiles(filenames) {
    const entries = await Promise.all(
      filenames.map(async (filename) => [filename, await this.readFile(filename)])
    );

    return Object.fromEntries(entries);
  }
}

module.exports = FileManagerPromises;
