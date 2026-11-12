# Laboratory Work 22

Tasks 1-3: MySQL connection and pool, parameterized CRUD, errors, transactions and streaming 100000 rows.
Copy .env.example to .env and set your local credentials. The application uses student, never root.
If Docker is installed, docker compose up -d provides a dedicated MySQL server. Wait until ready, then npm install and npm test.
The CRUD demonstration rolls back its changes. Large data and error demonstration tables are temporary.
Verified against a real isolated MySQL 8.4.0 instance on localhost port 33306 using the student account: single connection, pool, CRUD, expected errors, commit/rollback, buffered and streamed reads of 100000 records. See test-results.txt for the actual output. The temporary server was stopped after the run.
