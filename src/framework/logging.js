import { format, createLogger, transports } from 'winston'

const { printf } = format

const logFormat = printf(({ level, message, timestamp }) => {
  return `${level}:${timestamp} === ${message}`
})
transports.DailyRotateFile = require('winston-daily-rotate-file')

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.splat(),
    format.simple(),
  ),
  transports: [
    new transports.Console({
      json: true,
      timestamp: true,
    }),
    new transports.DailyRotateFile({
      format: format.combine(
        format.timestamp(),
        format.splat(),
        format.simple(),
        logFormat,
      ),
      filename: 'logs/runtime%DATE%',
      datePattern: 'YYYYMM',
      prepend: true,
      level: 'info',
    }),
    new transports.DailyRotateFile({
      format: format.combine(
        format.timestamp(),
        format.splat(),
        format.simple(),
        logFormat,
      ),
      filename: 'logs/error%DATE%',
      datePattern: 'YYYYMM',
      prepend: true,
      level: 'error',
    }),
  ],
})

export {
  logger,
}