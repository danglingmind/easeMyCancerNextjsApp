#!/usr/bin/env node

/*
  Connection check script for MongoDB
  - Verifies required env vars exist
  - Tests MongoDB connection
  - Validates database access and collections

  Usage:
    node scripts/check-mongodb.js
*/

// Load environment variables from .env.local explicitly
try {
  require('dotenv').config({ path: '.env.local' })
} catch {}

const { MongoClient } = require('mongodb')

function log(title, value) {
	const label = `» ${title}`
	console.log(label.padEnd(28), value)
}

async function main() {
	console.log('\n=== MongoDB Connection Check ===\n')

	const { MONGODB_URI } = process.env

	// Basic env validation
	if (!MONGODB_URI) {
		console.error('ERROR: MONGODB_URI is missing')
		console.error('Please add MONGODB_URI to your .env.local file')
		process.exit(1)
	}

	// Validate URI format
	if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
		console.error('ERROR: Invalid MongoDB URI format')
		console.error('URI must start with "mongodb://" or "mongodb+srv://"')
		process.exit(1)
	}

	log('MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')) // Hide credentials
	log('Environment:', process.env.NODE_ENV || 'development')

	// Connection options optimized for connection testing
	const options = {
		maxPoolSize: 1,
		connectTimeoutMS: 10000,
		serverSelectionTimeoutMS: 10000,
		socketTimeoutMS: 30000,
	}

	let client = null

	try {
		console.log('\nConnecting to MongoDB...')
		client = new MongoClient(MONGODB_URI, options)
		await client.connect()
		console.log('✔ Connected successfully')

		console.log('Testing database access...')
		const db = client.db('forms_app')
		
		// Test admin ping
		await db.admin().ping()
		console.log('✔ Database ping successful')

		// List collections
		console.log('Checking collections...')
		const collections = await db.listCollections().toArray()
		log('Collections found:', collections.length)
		
		if (collections.length > 0) {
			collections.forEach(col => {
				console.log(`  - ${col.name}`)
			})
		} else {
			console.log('  (No collections found - this is normal for a new database)')
		}

		// Test write access (create a test document)
		console.log('Testing write access...')
		const testCollection = db.collection('_connection_test')
		const testDoc = { 
			test: true, 
			timestamp: new Date(),
			environment: process.env.NODE_ENV || 'development'
		}
		
		const insertResult = await testCollection.insertOne(testDoc)
		console.log('✔ Write test successful')

		// Test read access
		console.log('Testing read access...')
		const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId })
		if (foundDoc) {
			console.log('✔ Read test successful')
		} else {
			throw new Error('Read test failed - document not found')
		}

		// Clean up test document
		await testCollection.deleteOne({ _id: insertResult.insertedId })
		console.log('✔ Cleanup successful')

		console.log('\nAll checks passed. ✅\n')
		process.exit(0)

	} catch (err) {
		console.error('\nConnection check failed. ❌')
		console.error(err?.message || err)
		
		// Helpful hints based on error type
		console.error('\nTroubleshooting hints:')
		
		if (err.message.includes('authentication')) {
			console.error('- Check your MongoDB username and password')
			console.error('- Ensure the user has proper permissions')
		} else if (err.message.includes('network') || err.message.includes('timeout')) {
			console.error('- Check your network connection')
			console.error('- Verify MongoDB server is running and accessible')
			console.error('- For MongoDB Atlas, check your IP whitelist settings')
		} else if (err.message.includes('SSL') || err.message.includes('TLS')) {
			console.error('- SSL/TLS connection issues detected')
			console.error('- For MongoDB Atlas, ensure you\'re using mongodb+srv://')
			console.error('- Check your MongoDB Atlas cluster status')
		} else {
			console.error('- Verify MONGODB_URI is correct')
			console.error('- Ensure MongoDB server is running')
			console.error('- Check database permissions')
		}
		
		process.exit(2)
	} finally {
		if (client) {
			try {
				await client.close()
				console.log('Connection closed gracefully')
			} catch (closeErr) {
				console.error('Warning: Error closing connection:', closeErr.message)
			}
		}
	}
}

main()
