const http = require('http');

const student = {
  fullName: 'ЗУБЕЛИК ТРОФИМ АЛЕКСЕЕВИЧ',
  group: '477',
  journalNumber: 9,
};

function atan(x) {
  let term = x;
  let sum = term;
  let n = 1;

  while (Math.abs(term) > 1e-16) {
    term *= -x * x;
    sum += term / (2 * n + 1);
    n += 1;
  }

  return sum;
}

function calculatePi(digits) {
  const pi = 16 * atan(1 / 5) - 4 * atan(1 / 239);
  return pi.toFixed(digits);
}

const piValue = calculatePi(student.journalNumber);

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <main style="font-family: Arial, sans-serif; line-height: 1.6">
      <div>${student.fullName}</div>
      <div>Группа: ${student.group}</div>
      <div>Пи до ${student.journalNumber} знаков: ${piValue}</div>
    </main>
  `);
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
