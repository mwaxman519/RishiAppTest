/**
 * Environment Configuration
 * 
 * This exports the getEnvironmentIndicator function which provides environment-specific
 * UI indicator settings to help users identify which environment they're currently in.
 */

// Environment indicator information for UI display
export interface EnvironmentIndicator {
  label: string;
  color: string;
  textColor: string;
  show: boolean;
}

/**
 * Get environment indicator information for displaying in the UI
 * This helps users identify which environment they are currently using
 */
export function getEnvironmentIndicator(): EnvironmentIndicator {
  // Determine environment based on NODE_ENV and other environment variables
  const isProd = process.env.NODE_ENV === 'production';
  const isReplit = Boolean(process.env.REPL_ID || process.env.REPL_SLUG);
  
  // Determine environment
  const env = isProd 
    ? (isReplit ? 'staging' : 'production')
    : 'development';
  
  switch (env) {
    case 'production':
      return {
        label: 'PRODUCTION',
        color: '#ef4444', // red-500
        textColor: '#ffffff',
        show: false, // Hide in production by default
      };
    case 'staging':
      return {
        label: 'STAGING',
        color: '#eab308', // yellow-500
        textColor: '#000000',
        show: true,
      };
    case 'development':
    default:
      return {
        label: 'DEVELOPMENT',
        color: '#22c55e', // green-500
        textColor: '#ffffff',
        show: true,
      };
  }
}