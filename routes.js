const Router = require('@koa/router');
const { GROUP } = require('./config');
const { students, nextId } = require('./data/students');
const { validateStudent, validateUser } = require('./validation');

const router = new Router();

const users = [
  { id: 1, name: 'Ivan Ivanov', group: GROUP },
  { id: 2, name: 'Maria Petrova', group: GROUP }
];

function findById(items, id) {
  return items.find((item) => item.id === Number(id));
}

function requireBody(ctx) {
  if (!ctx.request.body || typeof ctx.request.body !== 'object') {
    ctx.throw(400, 'JSON request body is required');
  }

  return ctx.request.body;
}

function sendValidationError(ctx, errors) {
  ctx.status = 400;
  ctx.body = { error: 'Validation failed', details: errors, status: 400 };
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function sortStudents(items, sort) {
  if (!sort) return items;

  const descending = sort.startsWith('-');
  const field = descending ? sort.slice(1) : sort;
  if (!['name', 'course'].includes(field)) return items;

  return items.sort((left, right) => {
    const result = field === 'course'
      ? left.course - right.course
      : left.name.localeCompare(right.name);
    return descending ? -result : result;
  });
}

router.get('/', (ctx) => {
  ctx.type = 'html';
  ctx.body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Laboratory Work 15</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; color: #1f2937; background: #eef2f6; }
      main { max-width: 720px; margin: 48px auto; padding: 32px; background: white; border: 1px solid #d5dce5; }
      h1 { margin-top: 0; color: #173b63; }
      li { margin: 10px 0; }
      .date { color: #52657a; }
    </style>
  </head>
  <body>
    <main>
      <h1>Laboratory Work 15</h1>
      <p>Welcome to the Koa.js student management server.</p>
      <ul>
        <li>Group: ${GROUP}</li>
        <li>REST API: /api/users</li>
        <li>Student API: /students</li>
      </ul>
      <p class="date">Current date and time: ${new Date().toLocaleString('en-GB')}</p>
    </main>
  </body>
</html>`;
});

router.get('/api/users', (ctx) => {
  ctx.body = users;
});

router.post('/api/users', (ctx) => {
  const { errors, value } = validateUser(requireBody(ctx));
  if (errors.length) return sendValidationError(ctx, errors);

  const user = { id: nextId(users), ...value };
  users.push(user);
  ctx.status = 201;
  ctx.body = user;
});

router.put('/api/users/:id', (ctx) => {
  const user = findById(users, ctx.params.id);
  if (!user) ctx.throw(404, 'User not found');

  const { errors, value } = validateUser(requireBody(ctx));
  if (errors.length) return sendValidationError(ctx, errors);

  Object.assign(user, value);
  ctx.body = user;
});

router.delete('/api/users/:id', (ctx) => {
  const index = users.findIndex((user) => user.id === Number(ctx.params.id));
  if (index === -1) ctx.throw(404, 'User not found');

  users.splice(index, 1);
  ctx.body = { message: 'User deleted successfully' };
});

router.get('/protected', (ctx) => {
  ctx.body = { message: 'Protected resource is available' };
});

router.get('/error', () => {
  const error = new Error('Intentional test error');
  error.status = 500;
  throw error;
});

router.get('/students', (ctx) => {
  let result = students.slice();
  const { group, search, sort } = ctx.query;

  if (group) result = result.filter((student) => student.group === group);
  if (search) {
    const query = search.toLowerCase();
    result = result.filter((student) => student.name.toLowerCase().includes(query));
  }

  sortStudents(result, sort);

  const total = result.length;
  const offset = parseNumber(ctx.query.offset, 0);
  const limit = parseNumber(ctx.query.limit, 10);
  const page = result.slice(offset, offset + limit);

  ctx.body = {
    total,
    offset,
    limit,
    students: page
  };
});

router.get('/students/:id', (ctx) => {
  const student = findById(students, ctx.params.id);
  if (!student) ctx.throw(404, 'Student not found');
  ctx.body = student;
});

router.post('/students', (ctx) => {
  const { errors, value } = validateStudent(requireBody(ctx));
  if (errors.length) return sendValidationError(ctx, errors);

  const student = { id: nextId(students), ...value };
  students.push(student);
  ctx.status = 201;
  ctx.body = student;
});

router.put('/students/:id', (ctx) => {
  const student = findById(students, ctx.params.id);
  if (!student) ctx.throw(404, 'Student not found');

  const { errors, value } = validateStudent(requireBody(ctx), true);
  if (errors.length) return sendValidationError(ctx, errors);

  Object.assign(student, value);
  ctx.body = student;
});

router.delete('/students/:id', (ctx) => {
  const index = students.findIndex((student) => student.id === Number(ctx.params.id));
  if (index === -1) ctx.throw(404, 'Student not found');

  students.splice(index, 1);
  ctx.body = { message: 'Student deleted successfully' };
});

module.exports = {
  router
};
