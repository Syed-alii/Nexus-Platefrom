const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dns = require('dns'); // Added
const connectDB = require('./config/db');

// Set DNS servers for MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']); // Added

// Load environment variables
dotenv.config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

// Connect to database
connectDB();

const app = express();

// Secure CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://nexus-investor-entrepreneur-collabo-sigma.vercel.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Body Parser Middleware (MUST come before sanitization)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Middleware
app.use(helmet()); // Set security HTTP headers

// Custom NoSQL Injection Sanitization for Express 5 compatibility
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
  };
  sanitize(req.body);
  sanitize(req.params);
  next();
});

app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000 // Increased limit from 100 to 1000
});
app.use('/api/', limiter);

// Specific rate limiter for Auth (Forgot Password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per window
  message: 'Too many password reset attempts, please try again after 15 minutes'
});
app.use('/api/auth/forgot-password', authLimiter);

// Debug Logging
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  console.log('[DEBUG] Body:', JSON.stringify(req.body));
  next();
});

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Initialize Socket.io
const initSocket = require('./socket');
initSocket(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
