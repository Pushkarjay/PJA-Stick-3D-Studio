// Configuration Module
// Loads environment variables and secrets from Secret Manager

import dotenv from 'dotenv'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

dotenv.config()

/**
 * Fetch secret from Google Secret Manager
 * @param {string} secretName - Name of the secret
 * @returns {Promise<string|null>} Secret value or null if not found
 */
async function getSecret(secretName) {
  try {
    // In production on Cloud Run, use Secret Manager
    // In development, fall back to environment variables
    if (process.env.NODE_ENV === 'production' && process.env.GCP_PROJECT_ID) {
      const client = new SecretManagerServiceClient()
      const name = `projects/${process.env.GCP_PROJECT_ID}/secrets/${secretName}/versions/latest`
      
      const [version] = await client.accessSecretVersion({ name })
      const payload = version.payload?.data?.toString('utf8')
      
      if (payload) {
        console.log(`✓ Loaded secret: ${secretName} from Secret Manager`)
        return payload
      }
    }
    
    // Fallback to environment variable
    return process.env[secretName] || null
  } catch (error) {
    console.warn(`Warning: Could not load secret ${secretName}:`, error.message)
    return process.env[secretName] || null
  }
}

// Configuration object
const config = {
  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8080,
  
  // GCP & Firebase
  gcpProjectId: process.env.GCP_PROJECT_ID,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT_ID,
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  
  // Cloud Storage
  gcs: {
    bucketName: process.env.GCS_BUCKET_NAME,
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  // WhatsApp
  whatsapp: {
    shopNumber: process.env.SHOP_WHATSAPP_NUMBER || '916372362313',
  },
  
  // Twilio (will be loaded from Secret Manager in production)
  twilio: {
    accountSid: null, // Loaded async
    authToken: null,  // Loaded async
    whatsappFrom: null, // Loaded async
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
}

/**
 * Initialize configuration and load secrets
 * Call this at application startup
 */
export async function initializeConfig() {
  console.log('Initializing configuration...')
  
  // Load Twilio secrets (optional)
  config.twilio.accountSid = await getSecret('TWILIO_ACCOUNT_SID') || process.env.TWILIO_ACCOUNT_SID
  config.twilio.authToken = await getSecret('TWILIO_AUTH_TOKEN') || process.env.TWILIO_AUTH_TOKEN
  config.twilio.whatsappFrom = await getSecret('TWILIO_WHATSAPP_FROM') || process.env.TWILIO_WHATSAPP_FROM
  
  // Check if Twilio is configured
  if (config.twilio.accountSid && config.twilio.authToken) {
    console.log('✓ Twilio WhatsApp Business API configured')
  } else {
    console.log('ℹ Twilio not configured - using wa.me links only')
  }
  
  // Validate required configuration
  if (!config.gcpProjectId) {
    console.warn('Warning: GCP_PROJECT_ID not set')
  }
  if (!config.gcs.bucketName) {
    console.warn('Warning: GCS_BUCKET_NAME not set')
  }
  
  console.log('Configuration initialized successfully')
}

export default config
