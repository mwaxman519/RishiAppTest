/**
 * Event bus implementation for the application
 * This is used to publish and subscribe to events across the application
 */

type EventCallback = (data: any) => void | Promise<void>;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   * @param eventName The name of the event to subscribe to
   * @param callback The callback to execute when the event is published
   * @returns A function to unsubscribe from the event
   */
  subscribe(eventName: string, callback: EventCallback): () => void {
    const callbacks = this.events.get(eventName) || [];
    callbacks.push(callback);
    this.events.set(eventName, callbacks);

    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(eventName) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        this.events.set(eventName, callbacks);
      }
    };
  }

  /**
   * Publish an event with data
   * @param eventName The name of the event to publish
   * @param data The data to pass to the subscribers
   */
  async publish(eventName: string, data: any): Promise<void> {
    const callbacks = this.events.get(eventName) || [];
    
    console.log(`Event published: ${eventName}`, { 
      details: typeof data === 'object' ? JSON.stringify(data) : data,
      subscribers: callbacks.length
    });
    
    // Execute all callbacks in parallel
    await Promise.all(
      callbacks.map(async (callback) => {
        try {
          await callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      })
    );
  }

  /**
   * Check if an event has subscribers
   * @param eventName The name of the event to check
   * @returns True if the event has subscribers, false otherwise
   */
  hasSubscribers(eventName: string): boolean {
    const callbacks = this.events.get(eventName) || [];
    return callbacks.length > 0;
  }

  /**
   * Clear all subscribers for an event
   * @param eventName The name of the event to clear
   */
  clearEvent(eventName: string): void {
    this.events.delete(eventName);
  }

  /**
   * Clear all events and subscribers
   */
  clearAllEvents(): void {
    this.events.clear();
  }
}

// Create a singleton instance of the event bus
export const eventBus = new EventBus();