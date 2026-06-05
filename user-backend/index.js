require('dotenv').config();

// Validate environment variables before starting
const { requireEnvVariables } = require('./config/validateEnv');
requireEnvVariables();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const logger = require('./helpers/logger');
const errorHandler = require('./helpers/errorHandler');

const app = express();

// Request Logger for Debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// CORS Configuration (MUST BE BEFORE ROUTES)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 5000 : 1000, // higher limit in development
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const connectDB = require('./config/db');
connectDB();

// Session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'whatsapp-bot-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: (MongoStore.create ? MongoStore : MongoStore.default).create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
  }
}));

const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const templateRoutes = require('./routes/templateRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const otpRoutes = require('./routes/otpRoutes');
const openwaWebhookRoutes = require('./routes/openwaWebhookRoutes');
const openwaRoutes = require('./routes/openwaRoutes');

app.use(express.json());
app.use('/api/templates', templateRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth/otp', otpRoutes);
app.use('/api/openwa-session', openwaRoutes);
app.use('/api/openwa', openwaWebhookRoutes);
app.use('/api', messageRoutes);
app.use('/api', pdfRoutes);

// Error Handling Middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`📡 Server running on port ${PORT}`);

  // Schedulers
  const { scheduleDailyNotifications, scheduleEventReminders } = require('./helpers/notificationScheduler');
  const { initializeMessageScheduler } = require('./helpers/messageScheduler');

  scheduleDailyNotifications();
  scheduleEventReminders();
  initializeMessageScheduler();
  require('./workers/mediaWorker');
});
