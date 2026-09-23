const { spawn } = require('child_process');
const fs = require('fs/promises');

const baseUrl = 'http://127.0.0.1:3000';
const results = [];

function check(label, actual, expected) {
  const passed = actual === expected;
  results.push(`${passed ? 'PASS' : 'FAIL'} | ${label} | expected ${expected}, received ${actual}`);
  if (!passed) throw new Error(results.at(-1));
}

async function request(method, route, body, headers = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  return { response, payload };
}

async function waitForServer(child) {
  let output = '';

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server did not start in time')), 5000);

    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
      if (output.includes('Server is running')) {
        clearTimeout(timer);
        resolve();
      }
    });

    child.stderr.on('data', (chunk) => {
      output += chunk.toString();
    });

    child.on('error', reject);
  });
}

async function runChecks() {
  const child = spawn(process.execPath, ['server.js'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let serverOutput = '';
  child.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
  child.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

  try {
    await waitForServer(child);

    const home = await fetch(`${baseUrl}/`);
    const homeHtml = await home.text();
    check('Task 1 home page', home.status, 200);
    check('Task 1 HTML title', homeHtml.includes('Laboratory Work 15'), true);
    check('Task 1 group', homeHtml.includes('BBMO-01-23'), true);

    const users = await request('GET', '/api/users');
    check('Task 2 list users', users.response.status, 200);
    check('Task 2 initial users', users.payload.length, 2);

    const createdUser = await request('POST', '/api/users', {
      name: 'Test User',
      group: 'BBMO-01-23'
    });
    check('Task 2 create user', createdUser.response.status, 201);

    const updatedUser = await request('PUT', `/api/users/${createdUser.payload.id}`, {
      name: 'Updated User',
      group: 'BBMO-02-23'
    });
    check('Task 2 update user', updatedUser.response.status, 200);

    const invalidUser = await request('POST', '/api/users', { name: '' });
    check('Task 2 invalid user', invalidUser.response.status, 400);

    const deletedUser = await request('DELETE', `/api/users/${createdUser.payload.id}`);
    check('Task 2 delete user', deletedUser.response.status, 200);
    const missingUser = await request('PUT', '/api/users/9999', {
      name: 'No User',
      group: 'BBMO-01-23'
    });
    check('Task 2 missing user', missingUser.response.status, 404);

    const unauthorized = await request('GET', '/protected');
    check('Task 3 authorization required', unauthorized.response.status, 401);
    const authorized = await request('GET', '/protected', undefined, { Authorization: 'Bearer demo-token' });
    check('Task 3 authorized request', authorized.response.status, 200);
    const errorRoute = await request('GET', '/error');
    check('Task 3 error middleware', errorRoute.response.status, 500);
    check('Task 3 JSON error response', errorRoute.payload.status, 500);

    const filtered = await request('GET', '/students?group=BBMO-01-23&limit=4');
    check('Task 4 group filter', filtered.response.status, 200);
    check('Task 4 filtered result size', filtered.payload.students.length, 4);
    check('Task 4 filtered group', filtered.payload.students.every((student) => student.group === 'BBMO-01-23'), true);

    const existingStudent = await request('GET', '/students/1');
    check('Task 4 get student by id', existingStudent.response.status, 200);
    check('Task 4 returned student id', existingStudent.payload.id, 1);

    const createdStudent = await request('POST', '/students', {
      name: 'New Student',
      group: 'BBMO-01-23',
      course: 2
    });
    check('Task 4 create student', createdStudent.response.status, 201);

    const invalidStudent = await request('POST', '/students', {
      name: 'Invalid Student',
      group: 'BBMO-01-23',
      course: 7
    });
    check('Task 4 invalid student', invalidStudent.response.status, 400);

    const updatedStudent = await request('PUT', `/students/${createdStudent.payload.id}`, { course: 3 });
    check('Task 4 update student', updatedStudent.response.status, 200);

    const missingStudent = await request('GET', '/students/9999');
    check('Task 4 missing student', missingStudent.response.status, 404);

    const allStudents = await request('GET', '/students?limit=1');
    check('Task 5 generated dataset', allStudents.response.status, 200);
    check('Task 5 generated student count', allStudents.payload.total >= 50, true);

    const paged = await request('GET', '/students?limit=5&offset=10&sort=-name&search=a');
    check('Task 5 pagination and search', paged.response.status, 200);
    check('Task 5 page size', paged.payload.students.length <= 5, true);
    check('Task 5 search result', paged.payload.total > 0, true);
    check('Task 5 descending sort', paged.payload.students.every((student, index, page) => (
      index === 0 || page[index - 1].name.localeCompare(student.name) >= 0
    )), true);

    const deletedStudent = await request('DELETE', `/students/${createdStudent.payload.id}`);
    check('Task 5 delete student', deletedStudent.response.status, 200);
  } finally {
    await fs.writeFile('server-run.txt', serverOutput, 'utf8');
    child.kill();
  }
}

runChecks()
  .then(async () => {
    const report = [
      'Laboratory Work 15 API checks',
      '==============================',
      ...results,
      '',
      `Summary: ${results.filter((line) => line.startsWith('PASS')).length}/${results.length} checks passed`
    ].join('\n');

    await fs.writeFile('test-results.txt', `${report}\n`, 'utf8');
    console.log(report);
  })
  .catch(async (error) => {
    results.push(`FAIL | test runner | ${error.message}`);
    await fs.writeFile('test-results.txt', `${results.join('\n')}\n`, 'utf8');
    console.error(error.message);
    process.exitCode = 1;
  });
