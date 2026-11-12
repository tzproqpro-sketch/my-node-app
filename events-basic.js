const { EventEmitter } = require('node:events');
const emitter = new EventEmitter();
emitter.on('greet', name => console.log('[greet] Hello, ' + name));
emitter.on('info', () => console.log('[info] Group 477'));
emitter.on('bye', () => console.log('[bye] Goodbye!'));
console.log('greet with listener:', emitter.emit('greet', 'Trofim'));
emitter.emit('info');
emitter.emit('bye');
console.log('unknown without listeners:', emitter.emit('unknown'));
