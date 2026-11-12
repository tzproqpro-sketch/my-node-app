# Laboratory Work 24

Tasks 1-3: real MongoDB persistence, Koa REST API, MVC and service layers, Joi validation, pagination, filtering, text search, aggregation and streaming CSV export.
Run npm install then npm test. Tests start a real isolated MongoDB server and stop it afterwards.
For normal operation set MONGODB_URI and DB_NAME, then npm start. Default port is 3000.
The model owns MongoDB queries and validates writes. The service checks duplicate email and simulates notifications in the console. Passwords are outside the user schema and are not accepted.
Group values accept the assignment format BBMO-XX-XX (also the Cyrillic prefix); X-Group is ASCII-safe BBMO-01-23.
