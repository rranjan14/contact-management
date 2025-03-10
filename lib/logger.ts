/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Logger utility for consistent logging across the application
 * Helps with tracking errors and debugging in production environments like Vercel
 */
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data ? data : '');
  },
  error: (message: string, error: any) => {
    console.error(`[ERROR] ${message}`, error);
    // You can add additional error reporting here if needed
    // e.g., Sentry, LogRocket, etc.
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? data : '');
  }
};