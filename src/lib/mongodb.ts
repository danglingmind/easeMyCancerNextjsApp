import { MongoClient, Db, MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI

// Validate MongoDB URI format
function validateMongoURI(uri: string): void {
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error("Invalid MongoDB URI format. Must start with 'mongodb://' or 'mongodb+srv://'")
  }
  
  // For production, ensure we're using MongoDB Atlas (mongodb+srv://)
  if (process.env.NODE_ENV === 'production' && !uri.startsWith('mongodb+srv://')) {
    console.warn("⚠️ Warning: Using non-Atlas MongoDB URI in production. Consider using MongoDB Atlas for better reliability.")
  }
  
  // Check for required connection parameters
  if (uri.includes('@') && !uri.includes('retryWrites=true')) {
    console.warn("⚠️ Warning: Consider adding 'retryWrites=true' to your MongoDB URI for better reliability")
  }
}

validateMongoURI(uri)

// Vercel-optimized connection options for SSL/TLS issues
const options: MongoClientOptions = {
  // SSL/TLS configuration for Vercel
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  
  // Connection settings optimized for serverless
  maxPoolSize: 1,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  
  // Timeout settings for Vercel
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Compression for better performance
  compressors: ['zlib'],
  
  // Heartbeat settings
  heartbeatFrequencyMS: 10000,
}

let clientPromise: Promise<MongoClient> | null = null

// Connection retry logic for serverless environments
async function connectWithRetry(uri: string, options: MongoClientOptions, maxRetries = 3): Promise<MongoClient> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = new MongoClient(uri, options)
      await client.connect()
      
      // Test the connection
      await client.db("admin").admin().ping()
      
      console.log(`✅ MongoDB connected successfully (attempt ${attempt})`)
      return client
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts: ${error}`)
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000
      console.log(`⏳ Retrying MongoDB connection in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new Error("MongoDB connection failed after all retry attempts")
}

// Lazy connection initialization - only connects when actually needed
function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    if (process.env.NODE_ENV === "development") {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
      }

      if (!globalWithMongo._mongoClientPromise) {
        globalWithMongo._mongoClientPromise = connectWithRetry(uri, options)
      }
      clientPromise = globalWithMongo._mongoClientPromise
    } else {
      // In production mode, use retry logic for better reliability
      clientPromise = connectWithRetry(uri, options)
    }
  }
  return clientPromise
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await getClientPromise()
    
    // Verify connection is still alive
    await client.db("admin").admin().ping()
    
    return client.db("forms_app")
  } catch (error) {
    console.error("❌ Database connection error:", error)
    throw new Error(`Database connection failed: ${error}`)
  }
}

// Health check function for monitoring
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await getClientPromise()
    await client.db("admin").admin().ping()
    return true
  } catch (error) {
    console.error("❌ Database health check failed:", error)
    return false
  }
}

// Graceful shutdown function
export async function closeDatabase(): Promise<void> {
  try {
    if (clientPromise) {
      const client = await clientPromise
      await client.close()
      console.log("✅ Database connection closed gracefully")
    }
  } catch (error) {
    console.error("❌ Error closing database connection:", error)
  }
}

export default getClientPromise
