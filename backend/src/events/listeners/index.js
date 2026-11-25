const eventBus = require('../eventBus');
const registerActivityListeners = require('./activityListener');
const registerNotificationListeners = require('./notificationListener');

let isRegistered = false;

function registerEventListeners() {
  if (isRegistered) {
    return;
  }
  registerActivityListeners(eventBus);
  registerNotificationListeners(eventBus);
  isRegistered = true;
}

module.exports = registerEventListeners;

