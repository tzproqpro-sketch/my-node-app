# Laboratory Work 15

This project contains the first five tasks from Laboratory Work 15. It is a Koa.js server with a home page, two REST APIs, request logging, authorization, error handling, validation, filtering, pagination, sorting, searching, and generated student data.

## Run the server

```bash
npm install
npm start
```

Open `http://localhost:3000` in a browser.

## Run the API checks

```bash
npm test
```

The test script starts the server, checks the required routes, saves the response summary to `test-results.txt`, and saves request logs to `server-run.txt`.

## Main routes

- `GET /` - HTML page with laboratory and group information.
- `GET|POST /api/users` - list and create users.
- `PUT|DELETE /api/users/:id` - update and delete users.
- `GET /protected` - route protected by the `Authorization` header.
- `GET /error` - route used to check the error middleware.
- `GET|POST /students` - filter, search, paginate, create students.
- `GET|PUT|DELETE /students/:id` - read, update, and delete one student.

Screenshots from the checks are stored in `screenshots/`.
