const winston = require('winston');
const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    printf(i => `[${i.timestamp}] ${i.level}: ${i.message}`)
  ),
  transports: [new winston.transports.Console()]
});

module.exports = { logger };

