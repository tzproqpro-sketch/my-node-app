# Laboratory Work 21

Tasks 1-3: custom Readable, delayed Writable with backpressure, pipe versus pipeline.
Run npm test to run all examples. Run npm run task1, task2 or task3 separately.
Task 3 creates input.txt and output files. Its missing-file example shows the destination left open by pipe and explicitly cleans it up afterwards. pipeline destroys both streams automatically.
The transform chain operates on ASCII input. Assertions compare successful copies and check error cleanup.
