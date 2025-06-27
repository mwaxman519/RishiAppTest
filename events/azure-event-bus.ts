/**
 * Azure Functions-compatible event bus implementation
 * Uses database storage instead of in-memory events for cross-function communication
 */

import { db } from '../server/db';
import { systemEvents } from '../shared/schema';
import { eq, and, lt, sql } from 'drizzle-orm';

export interface EventPayload {
  [key: string]: any;
}

export interface EventMetadata {
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  source?: string;
  [key: string]: any;
}

export class AzureEventBus {
  private functionName: string;

  constructor(functionName: string = 'unknown') {
    this.functionName = functionName;
  }

  /**
   * Publish an event to the database for other functions to process
   */
  async publish(
    eventType: string,
    eventName: string,
    payload: EventPayload,
    metadata: EventMetadata = {}
  ): Promise<string> {
    try {
      const event = await db.insert(systemEvents).values({
        eventType,
        eventName,
        payload,
        source: this.functionName,
        metadata: {
          ...metadata,
          publishedAt: new Date().toISOString(),
          functionName: this.functionName
        }
      }).returning({ id: systemEvents.id });

      const eventId = event[0].id;
      
      console.log(`Event published: ${eventType}:${eventName}`, {
        eventId,
        source: this.functionName,
        payload: typeof payload === 'object' ? JSON.stringify(payload) : payload
      });

      return eventId;
    } catch (error) {
      console.error(`Failed to publish event ${eventType}:${eventName}:`, error);
      throw error;
    }
  }

  /**
   * Process pending events for this function
   * Should be called at the start of each API route handler
   */
  async processPendingEvents(eventTypes: string[] = []): Promise<void> {
    try {
      // Get pending events, optionally filtered by event types
      const whereConditions = [
        eq(systemEvents.status, 'pending'),
        lt(systemEvents.retryCount, systemEvents.maxRetries)
      ];

      if (eventTypes.length > 0) {
        whereConditions.push(sql`${systemEvents.eventType} = ANY(${eventTypes})`);
      }

      const events = await db.select()
        .from(systemEvents)
        .where(and(...whereConditions))
        .orderBy(systemEvents.createdAt)
        .limit(50);

      for (const event of events) {
        await this.processEvent(event);
      }

      // Clean up expired events
      await this.cleanupExpiredEvents();

    } catch (error) {
      console.error('Failed to process pending events:', error);
    }
  }

  /**
   * Process a single event
   */
  private async processEvent(event: any): Promise<void> {
    try {
      // Mark as processing
      await db.update(systemEvents)
        .set({
          status: 'processing',
          processedAt: new Date()
        })
        .where(eq(systemEvents.id, event.id));

      // Handle different event types
      const success = await this.handleEvent(event);

      if (success) {
        // Mark as completed
        await db.update(systemEvents)
          .set({
            status: 'completed',
            processedAt: new Date()
          })
          .where(eq(systemEvents.id, event.id));

        console.log(`Event processed successfully: ${event.eventType}:${event.eventName}`, {
          eventId: event.id,
          processor: this.functionName
        });
      } else {
        // Increment retry count
        await db.update(systemEvents)
          .set({
            status: 'pending',
            retryCount: event.retryCount + 1
          })
          .where(eq(systemEvents.id, event.id));
      }

    } catch (error) {
      console.error(`Failed to process event ${event.id}:`, error);
      
      // Increment retry count and mark as failed if max retries reached
      const newRetryCount = event.retryCount + 1;
      await db.update(systemEvents)
        .set({
          status: newRetryCount >= event.maxRetries ? 'failed' : 'pending',
          retryCount: newRetryCount
        })
        .where(eq(systemEvents.id, event.id));
    }
  }

  /**
   * Handle specific event types - override in subclasses
   */
  protected async handleEvent(event: any): Promise<boolean> {
    const { eventType, eventName, payload, metadata } = event;

    switch (eventType) {
      case 'booking':
        return await this.handleBookingEvent(eventName, payload, metadata);
      
      case 'user':
        return await this.handleUserEvent(eventName, payload, metadata);
      
      case 'organization':
        return await this.handleOrganizationEvent(eventName, payload, metadata);
      
      case 'notification':
        return await this.handleNotificationEvent(eventName, payload, metadata);
      
      default:
        console.log(`Unhandled event type: ${eventType}:${eventName}`);
        return true; // Mark as completed to avoid infinite retries
    }
  }

  /**
   * Handle booking-related events
   */
  protected async handleBookingEvent(eventName: string, payload: any, metadata: any): Promise<boolean> {
    switch (eventName) {
      case 'created':
        // Handle booking creation events
        console.log('Processing booking creation:', payload);
        // Add your booking creation logic here
        return true;
      
      case 'updated':
        // Handle booking update events
        console.log('Processing booking update:', payload);
        return true;
      
      case 'cancelled':
        // Handle booking cancellation events
        console.log('Processing booking cancellation:', payload);
        return true;
      
      default:
        console.log(`Unhandled booking event: ${eventName}`);
        return true;
    }
  }

  /**
   * Handle user-related events
   */
  protected async handleUserEvent(eventName: string, payload: any, metadata: any): Promise<boolean> {
    switch (eventName) {
      case 'registered':
        console.log('Processing user registration:', payload);
        return true;
      
      case 'profile_updated':
        console.log('Processing user profile update:', payload);
        return true;
      
      default:
        console.log(`Unhandled user event: ${eventName}`);
        return true;
    }
  }

  /**
   * Handle organization-related events
   */
  protected async handleOrganizationEvent(eventName: string, payload: any, metadata: any): Promise<boolean> {
    switch (eventName) {
      case 'created':
        console.log('Processing organization creation:', payload);
        return true;
      
      case 'updated':
        console.log('Processing organization update:', payload);
        return true;
      
      default:
        console.log(`Unhandled organization event: ${eventName}`);
        return true;
    }
  }

  /**
   * Handle notification events
   */
  protected async handleNotificationEvent(eventName: string, payload: any, metadata: any): Promise<boolean> {
    switch (eventName) {
      case 'send_email':
        console.log('Processing email notification:', payload);
        // Add email sending logic here
        return true;
      
      case 'send_sms':
        console.log('Processing SMS notification:', payload);
        // Add SMS sending logic here
        return true;
      
      default:
        console.log(`Unhandled notification event: ${eventName}`);
        return true;
    }
  }

  /**
   * Clean up expired events
   */
  private async cleanupExpiredEvents(): Promise<void> {
    try {
      await db.delete(systemEvents)
        .where(lt(systemEvents.expiresAt, new Date()));
      
      console.log('Expired events cleaned up');
    } catch (error) {
      console.error('Failed to cleanup expired events:', error);
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(): Promise<Record<string, number>> {
    try {
      const stats = await db.select({
        status: systemEvents.status,
        count: sql<number>`count(*)`
      })
      .from(systemEvents)
      .groupBy(systemEvents.status);

      return stats.reduce((acc, stat) => {
        if (stat.status) {
          acc[stat.status] = Number(stat.count);
        }
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Failed to get event stats:', error);
      return {};
    }
  }
}

// Factory function to create event bus instances for different Azure Functions
export function createEventBus(functionName: string): AzureEventBus {
  return new AzureEventBus(functionName);
}

// Default event bus instance
export const eventBus = new AzureEventBus('default');