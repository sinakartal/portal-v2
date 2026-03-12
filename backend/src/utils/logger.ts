/**
 * Structured logging utility.
 * Outputs JSON logs with timestamp, level, and context.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

function log(level: LogLevel, message: string, context?: Record<string, any>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }
  const output = JSON.stringify(entry)

  if (level === 'error') {
    console.error(output)
  } else if (level === 'warn') {
    console.warn(output)
  } else {
    console.log(output)
  }
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => log('info', message, context),
  warn: (message: string, context?: Record<string, any>) => log('warn', message, context),
  error: (message: string, context?: Record<string, any>) => log('error', message, context),
  debug: (message: string, context?: Record<string, any>) => log('debug', message, context),
}
