const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const Sentry = require('@sentry/node');
require('dotenv').config();

const { connectDB } = require('./config/db');

const app = express();

// Middleware
const originList = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const corsOptions = originList.length > 0
    ? {
        origin: (origin, callback) => {
            if (!origin || originList.includes(origin)) return callback(null, true);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    }
    : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));
const sentryDsn = String(process.env.SENTRY_DSN || '').trim();
const sentryEnabled = sentryDsn.length > 0 && sentryDsn !== 'YOUR_DSN';
if (sentryEnabled) {
    Sentry.init({
        dsn: sentryDsn,
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1)
    });
    if (Sentry.Handlers && typeof Sentry.Handlers.requestHandler === 'function') {
        app.use(Sentry.Handlers.requestHandler());
    } else {
        console.warn('Sentry handlers are not available; skipping requestHandler.');
    }
}
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
    next();
});
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false
});

const examLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
});

// Test Route
app.get('/', (req, res) => {
    res.json({ message: '✅ Examor API is running!' });
});

// Routes
app.use('/api/auth',    authLimiter, require('./routes/auth.routes'));
app.use('/api/admin',   require('./routes/admin.routes'));
app.use('/api/doctor',  require('./routes/doctor.routes'));
app.use('/api/student', examLimiter, require('./routes/student.routes'));

// Error handler
if (sentryEnabled) {
    if (Sentry.Handlers && typeof Sentry.Handlers.errorHandler === 'function') {
        app.use(Sentry.Handlers.errorHandler());
    } else {
        console.warn('Sentry handlers are not available; skipping errorHandler.');
    }
}
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
