const { EventEmitter } = require("node:events");
const assert = require("node:assert/strict");
const emitter = new EventEmitter();
let regular = 0;
let once = 0;
emitter.on("tick", () => {
  regular++;
  console.log("[tick] on:", regular);
});
emitter.once("tick", () => {
  once++;
  console.log("[tick] once:", once);
});
for (let i = 0; i < 3; i++) emitter.emit("tick");
assert.equal(regular, 3);
assert.equal(once, 1);
console.log("on calls:", regular, "once calls:", once);
const order = [];
function first() {
  order.push(1);
  console.log("1. Group 477");
}
function second() {
  order.push(2);
  console.log("2. Second listener");
}
function third() {
  order.push(3);
  console.log("3. Third listener");
}
emitter.on("ordered", first);
emitter.addListener("ordered", second);
emitter.addListener("ordered", third);
console.log(
  "Listener names:",
  emitter.listeners("ordered").map((listener) => listener.name),
);
console.log("Before removal:", emitter.listenerCount("ordered"));
emitter.emit("ordered");
assert.deepEqual(order, [1, 2, 3]);
emitter.removeListener("ordered", second);
console.log("After removeListener:", emitter.listenerCount("ordered"));
assert.equal(emitter.listenerCount("ordered"), 2);
emitter.removeAllListeners("ordered");
console.log("After removeAllListeners:", emitter.listenerCount("ordered"));
assert.equal(emitter.listenerCount("ordered"), 0);
