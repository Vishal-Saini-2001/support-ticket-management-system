const { EventEmitter } = require('events');

class AppEventBus extends EventEmitter {}

const eventBus = new AppEventBus();

// Log internal emitter errors without crashing the process
eventBus.on('error', (err) => {
  console.error('[EventBus Error]:', err);
});

module.exports = eventBus;

