require('dotenv').config();

// Validate environment variables before starting
const { requireEnvVariables } = require('./config/validateEnv');
requireEnvVariables();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const app = express();
const path = require('path');
const fs = require('fs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const corsOptions = {
  origin: 'https://whatsapp-bot-eight-lime.vercel.app', // allow only your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // if you're using cookies or authorization headers
};

app.use(cors(corsOptions));

// Session middleware for follow-up context tracking
app.use(session({
  secret: process.env.SESSION_SECRET || 'whatsapp-bot-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

const connectDB = require('./config/db');

// Connect DB
connectDB();

const fontPath = path.resolve(__dirname, './fonts/NotoSansDevanagari-Regular.ttf');

// Scheduled daily message at 6 AM
const { scheduleDailyNotifications, scheduleEventReminders } = require('./helpers/notificationScheduler');
const { initializeMessageScheduler } = require('./helpers/messageScheduler');

const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const templateRoutes = require('./routes/templateRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

app.use(express.json());
app.use('/api/templates', templateRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api', messageRoutes);
app.use('/', webhookRoutes);
app.use('/api', pdfRoutes);

console.log(fs.existsSync(fontPath)); // should return true on Render

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `📡 Server running on port ${PORT}`);
  scheduleDailyNotifications();
  scheduleEventReminders();
  initializeMessageScheduler();
});