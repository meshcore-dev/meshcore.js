class EventEmitter {
  constructor() {
    this.eventListenersMap = new Map();
  }

  on(event, callback) {
    // create list of listeners for event if it doesn't exist
    if (!this.eventListenersMap.has(event)) {
      this.eventListenersMap.set(event, []);
    }

    // add listener for event
    this.eventListenersMap.get(event).push(callback);
  }

  off(event, callback) {
    // remove callback from listeners for this event
    if (this.eventListenersMap.has(event)) {
      const callbacks = this.eventListenersMap
        .get(event)
        .filter((cb) => cb !== callback);
      this.eventListenersMap.set(event, callbacks);
    }
  }

  once(event, callback) {
    // internal callback to handle the event
    const internalCallback = (...data) => {
      // we received an event, so lets remove the event listener
      this.off(event, internalCallback);

      // fire the original callback provided by the user
      setTimeout(() => callback(...data), 0);
    };

    // listen to this event
    this.on(event, internalCallback);
  }

  emit(event, ...data) {
    // invoke each listener for this event
    if (this.eventListenersMap.has(event)) {
      for (const eventListener of this.eventListenersMap.get(event)) {
        setTimeout(() => eventListener(...data), 0);
      }
    }
  }
}

export default EventEmitter;
