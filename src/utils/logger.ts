import winston from 'winston';
import { format } from 'winston';

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// Custom format for logs
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: customFormat,
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    // Write all errors to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(
        format.uncolorize(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: format.combine(
        format.uncolorize(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
  ],
});

// Add monitoring capabilities
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

// Add request tracking
export const httpLogger = {
  log: (message: string, meta?: any) => {
    logger.http(message, meta);
  },
};

// Add error tracking
export const errorHandler = (error: Error, context?: string) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };
  
  logger.error('Application error:', errorInfo);
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error tracking service (e.g., Sentry)
    // sendToErrorTrackingService(errorInfo);
  }
  
  return errorInfo;
};

// Export default logger instance
export default logger; 