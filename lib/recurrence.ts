/**
 * Recurrence pattern utilities for the booking system
 * This module handles creating, formatting, and parsing iCalendar-compatible recurrence patterns
 */

// Recurrence frequency options
export enum RecurrenceFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY"
}

// Days of the week for weekly recurrence
export enum RecurrenceDays {
  MONDAY = "MO",
  TUESDAY = "TU",
  WEDNESDAY = "WE",
  THURSDAY = "TH",
  FRIDAY = "FR",
  SATURDAY = "SA",
  SUNDAY = "SU"
}

// Base recurrence pattern interface
export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
  count?: number;
  until?: Date;
  byDay?: RecurrenceDays[];
  byMonthDay?: number;
}

/**
 * Format a recurrence pattern object into an iCalendar-compatible string
 * @param pattern The recurrence pattern object to format
 * @returns A string representation of the recurrence pattern
 */
export function formatRecurrencePattern(pattern: RecurrencePattern): string {
  let result = `FREQ=${pattern.frequency};INTERVAL=${pattern.interval}`;
  
  // Add by-day component for weekly recurrence
  if (pattern.frequency === RecurrenceFrequency.WEEKLY && pattern.byDay && pattern.byDay.length > 0) {
    result += `;BYDAY=${pattern.byDay.join(',')}`;
  }
  
  // Add by-month-day component for monthly recurrence
  if (pattern.frequency === RecurrenceFrequency.MONTHLY && pattern.byMonthDay) {
    result += `;BYMONTHDAY=${pattern.byMonthDay}`;
  }
  
  // Add count or until (but not both, as per iCalendar spec)
  if (pattern.count) {
    result += `;COUNT=${pattern.count}`;
  } else if (pattern.until) {
    // Format date according to iCalendar spec: YYYYMMDD
    const year = pattern.until.getFullYear();
    const month = (pattern.until.getMonth() + 1).toString().padStart(2, '0');
    const day = pattern.until.getDate().toString().padStart(2, '0');
    result += `;UNTIL=${year}${month}${day}`;
  }
  
  return result;
}

/**
 * Parse an iCalendar-compatible recurrence string into a RecurrencePattern object
 * @param recurrenceString The string to parse (e.g., "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR")
 * @returns A RecurrencePattern object representing the parsed string
 */
export function parseRecurrencePattern(recurrenceString: string): RecurrencePattern {
  const parts = recurrenceString.split(';');
  const pattern: Partial<RecurrencePattern> = {
    interval: 1 // Default interval
  };
  
  parts.forEach(part => {
    const [key, value] = part.split('=');
    
    switch (key) {
      case 'FREQ':
        pattern.frequency = value as RecurrenceFrequency;
        break;
        
      case 'INTERVAL':
        pattern.interval = parseInt(value, 10);
        break;
        
      case 'BYDAY':
        pattern.byDay = value.split(',') as RecurrenceDays[];
        break;
        
      case 'BYMONTHDAY':
        pattern.byMonthDay = parseInt(value, 10);
        break;
        
      case 'COUNT':
        pattern.count = parseInt(value, 10);
        break;
        
      case 'UNTIL':
        // Parse date from YYYYMMDD format
        const year = parseInt(value.substring(0, 4), 10);
        const month = parseInt(value.substring(4, 6), 10) - 1;
        const day = parseInt(value.substring(6, 8), 10);
        pattern.until = new Date(year, month, day);
        break;
        
      default:
        // Ignore unknown keys
        break;
    }
  });
  
  // Ensure frequency is set
  if (!pattern.frequency) {
    pattern.frequency = RecurrenceFrequency.WEEKLY;
  }
  
  return pattern as RecurrencePattern;
}

/**
 * Calculate the end date for a recurring series based on start date, pattern, and count
 * @param startDate The start date of the series
 * @param pattern The recurrence pattern
 * @param count The number of occurrences
 * @returns The estimated end date
 */
export function calculateRecurrenceEndDate(
  startDate: Date, 
  pattern: RecurrencePattern | string,
  count: number
): Date {
  // Parse pattern if it's a string
  const recurrencePattern = typeof pattern === 'string' 
    ? parseRecurrencePattern(pattern) 
    : pattern;
  
  // Clone start date to avoid modifying the original
  const endDate = new Date(startDate);
  
  switch (recurrencePattern.frequency) {
    case RecurrenceFrequency.DAILY:
      // For daily, add (count-1) * interval days
      endDate.setDate(endDate.getDate() + (count - 1) * recurrencePattern.interval);
      break;
      
    case RecurrenceFrequency.WEEKLY:
      // For weekly, add (count-1) * interval weeks
      endDate.setDate(endDate.getDate() + (count - 1) * 7 * recurrencePattern.interval);
      break;
      
    case RecurrenceFrequency.MONTHLY:
      // For monthly, add (count-1) * interval months
      endDate.setMonth(endDate.getMonth() + (count - 1) * recurrencePattern.interval);
      break;
      
    case RecurrenceFrequency.YEARLY:
      // For yearly, add (count-1) * interval years
      endDate.setFullYear(endDate.getFullYear() + (count - 1) * recurrencePattern.interval);
      break;
  }
  
  return endDate;
}

/**
 * Generate a human-readable description of a recurrence pattern
 * @param pattern The recurrence pattern to describe
 * @param startDate Optional start date for context
 * @param endDate Optional end date for context
 * @returns A human-readable string describing the pattern
 */
export function describeRecurrencePattern(
  pattern: RecurrencePattern | string,
  startDate?: Date,
  endDate?: Date
): string {
  // Parse pattern if it's a string
  const recurrencePattern = typeof pattern === 'string' 
    ? parseRecurrencePattern(pattern) 
    : pattern;
  
  let description = "";
  
  // Frequency and interval
  switch (recurrencePattern.frequency) {
    case RecurrenceFrequency.DAILY:
      description += recurrencePattern.interval === 1 
        ? "Daily" 
        : `Every ${recurrencePattern.interval} days`;
      break;
      
    case RecurrenceFrequency.WEEKLY:
      description += recurrencePattern.interval === 1 
        ? "Weekly" 
        : `Every ${recurrencePattern.interval} weeks`;
      
      // Add days for weekly recurrence
      if (recurrencePattern.byDay && recurrencePattern.byDay.length > 0) {
        const dayNames = recurrencePattern.byDay.map(day => {
          switch (day) {
            case RecurrenceDays.MONDAY: return "Monday";
            case RecurrenceDays.TUESDAY: return "Tuesday";
            case RecurrenceDays.WEDNESDAY: return "Wednesday";
            case RecurrenceDays.THURSDAY: return "Thursday";
            case RecurrenceDays.FRIDAY: return "Friday";
            case RecurrenceDays.SATURDAY: return "Saturday";
            case RecurrenceDays.SUNDAY: return "Sunday";
            default: return day;
          }
        });
        
        description += ` on ${dayNames.join(", ")}`;
      }
      break;
      
    case RecurrenceFrequency.MONTHLY:
      description += recurrencePattern.interval === 1 
        ? "Monthly" 
        : `Every ${recurrencePattern.interval} months`;
      
      // Add day of month for monthly recurrence
      if (recurrencePattern.byMonthDay) {
        description += ` on day ${recurrencePattern.byMonthDay}`;
      }
      break;
      
    case RecurrenceFrequency.YEARLY:
      description += recurrencePattern.interval === 1 
        ? "Yearly" 
        : `Every ${recurrencePattern.interval} years`;
      break;
  }
  
  // Add until or count
  if (recurrencePattern.until) {
    description += ` until ${recurrencePattern.until.toLocaleDateString()}`;
  } else if (recurrencePattern.count) {
    description += ` for ${recurrencePattern.count} occurrences`;
  } else if (endDate) {
    description += ` until ${endDate.toLocaleDateString()}`;
  }
  
  return description;
}