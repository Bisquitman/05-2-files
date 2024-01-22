import fs from 'node:fs';
import path from 'node:path';

function copyDirectory(sourceDir, targetDir, callback) {
  fs.readdir(sourceDir, (err, files) => {
    if (err) return callback(err);

    fs.mkdir(targetDir, { recursive: true }, err => {
      if (err) return callback(err);

      let filesLeft = files.length;
      if (filesLeft === 0) return callback(null);

      files.forEach(file => {
        const sourceFile = path.join(sourceDir, file);
        const targetFile = path.join(targetDir, file);

        fs.stat(sourceFile, (err, stats) => {
          if (err) return callback(err);

          if (stats.isDirectory()) {
            copyDirectory(sourceFile, targetFile, err => {
              if (err) return callback(err);

              filesLeft--;
              if (filesLeft === 0) return callback(null);
            });
          } else if (stats.isFile()) {
            fs.copyFile(sourceFile, targetFile, err => {
              if (err) return callback(err);

              filesLeft--;
              if (filesLeft === 0) return callback(null);
            });
          }
        });
      });
    });
  });
}

// Исходная директория
const sourceDir = path.join('./source');
// Целевая директория
const targetDir = path.join('./target');

copyDirectory(sourceDir, targetDir, err => {
  if (err) {
    return console.error(err);
  }

  console.log('Копирование успешно завершено');
});
