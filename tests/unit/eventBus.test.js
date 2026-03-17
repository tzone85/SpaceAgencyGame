/**
 * EventBus Tests
 *
 * Test suite for the EventBus pub/sub event system
 */

import EventBus from '../../src/game/EventBus.js';

describe('EventBus', () => {
  beforeEach(() => {
    EventBus.reset();
  });

  afterEach(() => {
    EventBus.reset();
  });

  describe('singleton pattern', () => {
    test('should create singleton instance', () => {
      const bus1 = new EventBus();
      const bus2 = new EventBus();

      expect(bus1).toBe(bus2);
    });

    test('should return same instance via getInstance', () => {
      const bus1 = EventBus.getInstance();
      const bus2 = EventBus.getInstance();

      expect(bus1).toBe(bus2);
    });

    test('should create instance via constructor or getInstance equally', () => {
      const bus1 = new EventBus();
      const bus2 = EventBus.getInstance();

      expect(bus1).toBe(bus2);
    });
  });

  describe('subscribe', () => {
    test('should add event listener', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('test:event', callback);

      expect(bus.listenerCount('test:event')).toBe(1);
    });

    test('should support multiple listeners for same event', () => {
      const bus = new EventBus();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      bus.subscribe('test:event', callback1);
      bus.subscribe('test:event', callback2);

      expect(bus.listenerCount('test:event')).toBe(2);
    });

    test('should support event namespacing', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('player.spawn', callback);
      bus.subscribe('player.destroy', callback);
      bus.subscribe('enemy.spawn', callback);

      expect(bus.listenerCount('player.spawn')).toBe(1);
      expect(bus.listenerCount('player.destroy')).toBe(1);
      expect(bus.listenerCount('enemy.spawn')).toBe(1);
    });

    test('should bind context to callback', () => {
      const bus = new EventBus();
      const context = { value: 42 };
      const callback = jest.fn(function() {
        return this.value;
      });

      bus.subscribe('test:event', callback, context);
      bus.emit('test:event');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should return unsubscribe function', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      const unsubscribe = bus.subscribe('test:event', callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
      expect(bus.listenerCount('test:event')).toBe(0);
    });

    test('should throw error for invalid event name', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      expect(() => {
        bus.subscribe('', callback);
      }).toThrow();

      expect(() => {
        bus.subscribe(null, callback);
      }).toThrow();
    });

    test('should throw error for non-function callback', () => {
      const bus = new EventBus();

      expect(() => {
        bus.subscribe('test:event', 'not a function');
      }).toThrow();

      expect(() => {
        bus.subscribe('test:event', null);
      }).toThrow();
    });
  });

  describe('unsubscribe', () => {
    test('should remove listener', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('test:event', callback);
      expect(bus.listenerCount('test:event')).toBe(1);

      bus.unsubscribe('test:event', callback);
      expect(bus.listenerCount('test:event')).toBe(0);
    });

    test('should remove only specified listener', () => {
      const bus = new EventBus();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      bus.subscribe('test:event', callback1);
      bus.subscribe('test:event', callback2);

      bus.unsubscribe('test:event', callback1);

      expect(bus.listenerCount('test:event')).toBe(1);
    });

    test('should handle context when unsubscribing', () => {
      const bus = new EventBus();
      const callback = jest.fn();
      const context1 = { id: 1 };
      const context2 = { id: 2 };

      bus.subscribe('test:event', callback, context1);
      bus.subscribe('test:event', callback, context2);

      bus.unsubscribe('test:event', callback, context1);

      expect(bus.listenerCount('test:event')).toBe(1);
    });

    test('should not fail when unsubscribing non-existent listener', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      expect(() => {
        bus.unsubscribe('test:event', callback);
      }).not.toThrow();
    });

    test('should clean up empty event arrays', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('test:event', callback);
      bus.unsubscribe('test:event', callback);

      expect(bus.getListeners('test:event')).toEqual([]);
    });
  });

  describe('emit', () => {
    test('should call listener when event is emitted', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('test:event', callback);
      bus.emit('test:event');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should pass data payload to listener', () => {
      const bus = new EventBus();
      const callback = jest.fn();
      const payload = { x: 10, y: 20 };

      bus.subscribe('test:event', callback);
      bus.emit('test:event', payload);

      expect(callback).toHaveBeenCalledWith(payload);
    });

    test('should emit data with different types', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('test:number', callback);
      bus.subscribe('test:string', callback);
      bus.subscribe('test:array', callback);
      bus.subscribe('test:object', callback);

      bus.emit('test:number', 42);
      bus.emit('test:string', 'hello');
      bus.emit('test:array', [1, 2, 3]);
      bus.emit('test:object', { key: 'value' });

      expect(callback).toHaveBeenNthCalledWith(1, 42);
      expect(callback).toHaveBeenNthCalledWith(2, 'hello');
      expect(callback).toHaveBeenNthCalledWith(3, [1, 2, 3]);
      expect(callback).toHaveBeenNthCalledWith(4, { key: 'value' });
    });

    test('should call all listeners for an event', () => {
      const bus = new EventBus();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      bus.subscribe('test:event', callback1);
      bus.subscribe('test:event', callback2);
      bus.subscribe('test:event', callback3);

      bus.emit('test:event');

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    test('should not call listeners for other events', () => {
      const bus = new EventBus();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      bus.subscribe('test:event1', callback1);
      bus.subscribe('test:event2', callback2);

      bus.emit('test:event1');

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
    });

    test('should bind context when calling listener', () => {
      const bus = new EventBus();
      const context = { name: 'TestContext' };
      const callback = jest.fn(function() {
        return this.name;
      });

      bus.subscribe('test:event', callback, context);
      bus.emit('test:event');

      expect(callback.mock.instances[0]).toBe(context);
    });

    test('should handle listener errors gracefully', () => {
      const bus = new EventBus();
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();

      bus.subscribe('test:event', errorCallback);
      bus.subscribe('test:event', normalCallback);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      bus.emit('test:event');

      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should handle listener removal during emission', () => {
      const bus = new EventBus();
      const callback1 = jest.fn(() => {
        bus.unsubscribe('test:event', callback2);
      });
      const callback2 = jest.fn();

      bus.subscribe('test:event', callback1);
      bus.subscribe('test:event', callback2);

      bus.emit('test:event');

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('should throw error for invalid event name', () => {
      const bus = new EventBus();

      expect(() => {
        bus.emit('');
      }).toThrow();

      expect(() => {
        bus.emit(null);
      }).toThrow();
    });

    test('should not call listeners if event has none', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('test:event1', callback);

      expect(() => {
        bus.emit('test:event2');
      }).not.toThrow();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    test('should check if event has listeners', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      expect(bus.hasListeners('test:event')).toBe(false);

      bus.subscribe('test:event', callback);
      expect(bus.hasListeners('test:event')).toBe(true);

      bus.unsubscribe('test:event', callback);
      expect(bus.hasListeners('test:event')).toBe(false);
    });

    test('should count listeners for event', () => {
      const bus = new EventBus();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      expect(bus.listenerCount('test:event')).toBe(0);

      bus.subscribe('test:event', callback1);
      expect(bus.listenerCount('test:event')).toBe(1);

      bus.subscribe('test:event', callback2);
      bus.subscribe('test:event', callback3);
      expect(bus.listenerCount('test:event')).toBe(3);
    });

    test('should get listeners for specific event', () => {
      const bus = new EventBus();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      bus.subscribe('test:event1', callback1);
      bus.subscribe('test:event2', callback2);

      const listeners = bus.getListeners('test:event1');
      expect(listeners.length).toBe(1);
      expect(listeners[0].callback).toBe(callback1);
    });

    test('should get all listeners if no event specified', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('event1', callback);
      bus.subscribe('event2', callback);

      const allListeners = bus.getListeners();
      expect(Object.keys(allListeners).length).toBe(2);
      expect(allListeners.event1).toBeDefined();
      expect(allListeners.event2).toBeDefined();
    });
  });

  describe('cleanup', () => {
    test('should clear all listeners for specific event', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('test:event', callback);
      bus.subscribe('test:event', callback);

      expect(bus.listenerCount('test:event')).toBe(2);

      bus.clearListeners('test:event');

      expect(bus.listenerCount('test:event')).toBe(0);
    });

    test('should clear all listeners for all events', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      bus.subscribe('event1', callback);
      bus.subscribe('event2', callback);
      bus.subscribe('event3', callback);

      expect(Object.keys(bus.getListeners()).length).toBe(3);

      bus.clearListeners();

      expect(Object.keys(bus.getListeners()).length).toBe(0);
    });

    test('should reset singleton instance', () => {
      const bus1 = new EventBus();
      const callback = jest.fn();

      bus1.subscribe('test:event', callback);

      EventBus.reset();

      const bus2 = new EventBus();

      expect(bus1).not.toBe(bus2);
      expect(bus2.listenerCount('test:event')).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    test('should handle complex event flow', () => {
      const bus = new EventBus();
      const playerCallback = jest.fn();
      const enemyCallback = jest.fn();
      const uiCallback = jest.fn();

      bus.subscribe('player.spawn', playerCallback);
      bus.subscribe('player.move', playerCallback);
      bus.subscribe('enemy.spawn', enemyCallback);
      bus.subscribe('ui.update', uiCallback);

      bus.emit('player.spawn', { id: 1, x: 10, y: 20 });
      bus.emit('enemy.spawn', { id: 2, x: 30, y: 40 });
      bus.emit('ui.update', { fps: 60 });
      bus.emit('player.move', { id: 1, x: 15, y: 25 });

      expect(playerCallback).toHaveBeenCalledTimes(2);
      expect(enemyCallback).toHaveBeenCalledTimes(1);
      expect(uiCallback).toHaveBeenCalledTimes(1);
    });

    test('should handle subscribe/unsubscribe cycles', () => {
      const bus = new EventBus();
      const callback = jest.fn();

      const unsubscribe1 = bus.subscribe('test:event', callback);
      bus.emit('test:event');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe1();
      bus.emit('test:event');
      expect(callback).toHaveBeenCalledTimes(1);

      bus.subscribe('test:event', callback);
      bus.emit('test:event');
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });
});
