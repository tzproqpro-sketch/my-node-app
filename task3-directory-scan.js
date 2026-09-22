const fs = require('fs/promises');
const path = require('path');
const { VARIANT } = require('./constants');
const { formatBytes } = require('./format');

const IGNORED_DIRECTORIES = new Set(['node_modules', '.git', 'screenshots']);

function createEmptyStats(rootDirectory) {
  return {
    variant: VARIANT,
    rootDirectory,
    scannedAt: new Date().toISOString(),
    foldersCount: 0,
    filesCount: 0,
    totalSizeBytes: 0,
    extensions: {},
    largestFiles: [],
    smallestFiles: []
  };
}

function addFile(stats, fileInfo) {
  const extension = path.extname(fileInfo.relativePath).toLowerCase() || '[no extension]';

  stats.filesCount += 1;
  stats.totalSizeBytes += fileInfo.size;

  if (!stats.extensions[extension]) {
    stats.extensions[extension] = {
      filesCount: 0,
      totalSizeBytes: 0
    };
  }

  stats.extensions[extension].filesCount += 1;
  stats.extensions[extension].totalSizeBytes += fileInfo.size;

  stats.largestFiles.push(fileInfo);
  stats.smallestFiles.push(fileInfo);
}

async function scanDirectory(rootDirectory, currentDirectory, stats) {
  const entries = await fs.readdir(currentDirectory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentDirectory, entry.name);
    const relativePath = path.relative(rootDirectory, absolutePath) || entry.name;

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      stats.foldersCount += 1;
      await scanDirectory(rootDirectory, absolutePath, stats);
      continue;
    }

    if (!entry.isFile() || entry.name === `report_${VARIANT}.json`) {
      continue;
    }

    const fileStats = await fs.stat(absolutePath);
    addFile(stats, {
      name: entry.name,
      relativePath,
      size: fileStats.size,
      sizeFormatted: formatBytes(fileStats.size)
    });
  }
}

function finalizeStats(stats) {
  stats.totalSizeFormatted = formatBytes(stats.totalSizeBytes);

  stats.largestFiles = stats.largestFiles
    .sort((left, right) => right.size - left.size)
    .slice(0, 5);

  stats.smallestFiles = stats.smallestFiles
    .sort((left, right) => left.size - right.size)
    .slice(0, 5);

  for (const extensionStats of Object.values(stats.extensions)) {
    extensionStats.totalSizeFormatted = formatBytes(extensionStats.totalSizeBytes);
  }

  return stats;
}

function printFiles(title, files) {
  console.log(title);

  if (files.length === 0) {
    console.log('  No files found');
    return;
  }

  files.forEach((file, index) => {
    console.log(
      `  ${index + 1}. ${file.name} (${file.sizeFormatted}) - ${file.relativePath}`
    );
  });
}

function printStats(stats) {
  console.log(`Directory analysis: ${stats.rootDirectory}`);
  console.log('');
  console.log(`Total folders: ${stats.foldersCount}`);
  console.log(`Total files: ${stats.filesCount}`);
  console.log(`Total size: ${stats.totalSizeFormatted} (${stats.totalSizeBytes} bytes)`);
  console.log('');
  console.log('File extensions:');

  for (const [extension, extensionStats] of Object.entries(stats.extensions)) {
    console.log(
      `  ${extension}: ${extensionStats.filesCount} files (${extensionStats.totalSizeFormatted})`
    );
  }

  console.log('');
  printFiles('Top 5 largest files:', stats.largestFiles);
  console.log('');
  printFiles('Top 5 smallest files:', stats.smallestFiles);
}

async function runTask3() {
  const inputDirectory = process.argv[2] || '.';
  const rootDirectory = path.resolve(inputDirectory);
  const stats = createEmptyStats(path.relative(process.cwd(), rootDirectory) || '.');

  await scanDirectory(rootDirectory, rootDirectory, stats);
  finalizeStats(stats);

  printStats(stats);

  const reportPath = path.join('.', `report_${VARIANT}.json`);
  await fs.writeFile(reportPath, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');

  console.log('');
  console.log(`Report saved: report_${VARIANT}.json`);
}

runTask3().catch((error) => {
  console.error(`Task 3 error: ${error.message}`);
  process.exitCode = 1;
});
