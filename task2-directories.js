const fs = require('fs/promises');
const path = require('path');
const { VARIANT } = require('./constants');

const projectRoot = path.join('.', `project_${VARIANT}`);

const directoryDescriptions = new Map([
  ['src', 'Application source code'],
  ['src/modules', 'Reusable modules'],
  ['src/components', 'UI or logical components'],
  ['src/utils', 'Utility helpers'],
  ['data', 'Project data files'],
  ['data/input', 'Input data'],
  ['data/output', 'Generated output data'],
  ['temp', 'Temporary files']
]);

async function recreateProjectRoot() {
  await fs.rm(projectRoot, { recursive: true, force: true });
  await fs.mkdir(projectRoot, { recursive: true });
}

async function createInitialStructure() {
  for (const [relativeDir, description] of directoryDescriptions.entries()) {
    const directoryPath = path.join(projectRoot, relativeDir);
    await fs.mkdir(directoryPath, { recursive: true });
    await fs.writeFile(
      path.join(directoryPath, 'info.txt'),
      `${description}\nVariant: ${VARIANT}\n`,
      'utf8'
    );
  }

  if (VARIANT % 2 === 0) {
    const createdAt = new Date().toISOString();
    for (const relativeDir of directoryDescriptions.keys()) {
      await fs.writeFile(
        path.join(projectRoot, relativeDir, 'README.md'),
        `Created at: ${createdAt}\n`,
        'utf8'
      );
    }
  } else {
    for (let index = 1; index <= 3; index += 1) {
      const nestedPath = path.join(projectRoot, 'src', 'components', String(index));
      await fs.mkdir(nestedPath, { recursive: true });
      await fs.writeFile(
        path.join(nestedPath, 'info.txt'),
        `Nested component folder ${index}\n`,
        'utf8'
      );
    }
  }
}

async function printTree(rootPath, prefix = '') {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  entries.sort((left, right) => {
    if (left.isDirectory() !== right.isDirectory()) {
      return left.isDirectory() ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });

  for (const [index, entry] of entries.entries()) {
    const isLast = index === entries.length - 1;
    const branch = isLast ? '`-- ' : '|-- ';
    console.log(`${prefix}${branch}${entry.name}`);

    if (entry.isDirectory()) {
      const nextPrefix = `${prefix}${isLast ? '    ' : '|   '}`;
      await printTree(path.join(rootPath, entry.name), nextPrefix);
    }
  }
}

async function updateStructure() {
  await fs.rename(path.join(projectRoot, 'temp'), path.join(projectRoot, 'data', 'temp'));
  await fs.rename(path.join(projectRoot, 'data', 'output'), path.join(projectRoot, 'data', 'results'));
  await fs.rm(path.join(projectRoot, 'data', 'temp'), { recursive: true, force: true });
}

async function runTask2() {
  await recreateProjectRoot();
  await createInitialStructure();

  console.log(`Initial tree for project_${VARIANT}:`);
  await printTree(projectRoot);

  await updateStructure();

  console.log('');
  console.log(`Updated tree for project_${VARIANT}:`);
  await printTree(projectRoot);
}

runTask2().catch((error) => {
  console.error(`Task 2 error: ${error.message}`);
  process.exitCode = 1;
});
