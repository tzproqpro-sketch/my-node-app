const fs = require('fs/promises');
const path = require('path');
const { FAVORITE_BOOKS, STUDENT, VARIANT } = require('./constants');
const { formatLine } = require('./format');

async function countLines(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return content.split(/\r?\n/).filter(Boolean).length;
}

async function runTask1() {
  const fileName = `student_${VARIANT}.txt`;
  const filePath = path.join('.', fileName);
  const now = new Date().toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const lines = [
    `Student: ${STUDENT.fullName}`,
    `Group: ${STUDENT.group}`,
    `Variant: ${STUDENT.variant}`,
    `Date: ${now}`,
    '',
    'Favorite books:',
    ...FAVORITE_BOOKS.map((book, index) => `${index + 1}. ${book}`)
  ];

  await fs.writeFile(filePath, `${lines.join('\n')}\n`, 'utf8');

  const totalLines = await countLines(filePath);
  await fs.appendFile(filePath, `Records count: ${totalLines + 1}\n`, 'utf8');

  const content = await fs.readFile(filePath, 'utf8');

  console.log(`Created file: ${fileName}`);
  console.log('File content:');
  console.log(formatLine());
  console.log(content.trimEnd());
  console.log(formatLine());
}

runTask1().catch((error) => {
  console.error(`Task 1 error: ${error.message}`);
  process.exitCode = 1;
});
