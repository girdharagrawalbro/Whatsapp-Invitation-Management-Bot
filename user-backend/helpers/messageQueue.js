const { Queue } = require('bullmq');
const logger = require('./logger');

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const messageQueue = new Queue('whatsapp-messages', {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

logger.info('✓ Message Queue Initialized');

module.exports = {
  messageQueue,
  redisOptions
};
