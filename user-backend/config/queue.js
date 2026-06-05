const { Queue } = require('bullmq');
const Redis = require('ioredis');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

const connection = new Redis(redisConfig);

const mediaQueue = new Queue('media-processing', { connection });
const pdfQueue = new Queue('pdf-generation', { connection });

module.exports = {
  mediaQueue,
  pdfQueue,
  connection
};
