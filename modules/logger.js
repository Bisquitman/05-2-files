import fs from 'node:fs/promises';
import EventEmitter from 'node:events';

export class Logger extends EventEmitter {
  constructor(filename, maxSize) {
    super();
    this.filename = filename;
    this.maxSize = maxSize;
    this.logQueue = [];
    this.writing = false;
  }

  log(message) {
    this.logQueue.unshift(message);
    if (!this.writing) {
      this.writing = true;
      this.writeLog();
    }
  }

  async writeLog() {
    if (this.logQueue.length > 0) {
      const message = this.logQueue.pop();
      await fs.appendFile(this.filename, message + '\n');
      this.checkFileSize();
      this.emit('messageLogged', message);
      this.writeLog();
    } else {
      this.writing = false;
    }
  }

  async getFileSize() {
    try {
      const stats = await fs.stat(this.filename);
      return stats.size;
    } catch (err) {
      return 0;
    }
  }

  checkFileSize() {
    const fileSize = this.getFileSize();
    if (fileSize > this.maxSize) {
      this.rotateLog();
    }
  }

  async rotateLog() {
    const backupFile = this.filename + '.bak';
    await fs.copyFile(this.filename, backupFile);
    await fs.truncate(this.filename, 0);
  }
}
