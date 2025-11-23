// Express Server for PJA Stick & 3D Studio
// Production-ready Node.js backend for Cloud Run

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import config, { initializeConfig } from './config.js'
import logger from './utils/logger.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { rateLimiter } from './middlewares/rateLimiter.js'

// Import routes
import productsRoutes from './routes/products.routes.js'
import ordersRoutes from './routes/orders.routes.js'
import adminRoutes from './routes/admin.routes.js'

const app = express()

// Initialize configuration and load secrets
await initializeConfig()

// Trust proxy (required for Cloud Run)
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
const corsOptions = {
  origin: config.nodeEnv === 'production'
    ? [config.cors.origin, /\.firebaseapp\.com$/, /\.web\.app$/]
    : '*',
  credentials: true,
}
app.use(cors(corsOptions))

// Compression
app.use(compression())

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }))
}

// Rate limiting (apply to all routes)
app.use(rateLimiter)

// Health check endpoint (bypass auth and rate limit)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  })
})

// API Routes
app.use('/api/products', productsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const PORT = config.port
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📦 Environment: ${config.nodeEnv}`)
  logger.info(`🌐 CORS origin: ${config.cors.origin}`)
  logger.info(`📱 WhatsApp: ${config.whatsapp.shopNumber}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

export default app
