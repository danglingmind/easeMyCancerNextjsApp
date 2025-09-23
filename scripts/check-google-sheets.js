#!/usr/bin/env node

/*
  Connection check script for Google Sheets
  - Verifies required env vars exist
  - Authenticates using service account
  - Reads header row from the configured spreadsheet

  Usage:
    node scripts/check-google-sheets.js
*/

// Load environment variables from .env.local explicitly
try {
  require('dotenv').config({ path: '.env.local' })
} catch {}

const { google } = require('googleapis')

function log(title, value) {
	const label = `» ${title}`
	console.log(label.padEnd(28), value)
}

async function main() {
	console.log('\n=== Google Sheets Connection Check ===\n')

	const {
		GOOGLE_SERVICE_ACCOUNT_EMAIL,
		GOOGLE_PRIVATE_KEY,
		NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID,
	} = process.env

	// Basic env validation
	let hasError = false
	if (!GOOGLE_SERVICE_ACCOUNT_EMAIL) {
		console.error('ERROR: GOOGLE_SERVICE_ACCOUNT_EMAIL is missing')
		hasError = true
	}
	if (!GOOGLE_PRIVATE_KEY) {
		console.error('ERROR: GOOGLE_PRIVATE_KEY is missing')
		hasError = true
	}
	if (!NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID) {
		console.error('ERROR: NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID is missing')
		hasError = true
	}
	if (hasError) process.exit(1)

	log('Service account email:', GOOGLE_SERVICE_ACCOUNT_EMAIL)
	log('Spreadsheet ID:', NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID)

	// Normalize private key newlines (common issue)
	const normalizedPrivateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')

	try {
		const auth = new google.auth.GoogleAuth({
			credentials: {
				client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
				private_key: normalizedPrivateKey,
			},
			scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
		})

		const sheets = google.sheets({ version: 'v4', auth })
		console.log('\nAuthenticating with Google...')
		await auth.getClient()
		console.log('✔ Authenticated successfully')

		console.log('Reading header row from sheet...')
		const res = await sheets.spreadsheets.values.get({
			spreadsheetId: NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID,
			range: 'Sheet1!1:1',
		})
		const headers = res.data.values?.[0] || []
		console.log('✔ Read successful')
		console.log('Header row:', headers.length ? headers.join(' | ') : '(empty)')

		console.log('\nAll checks passed. ✅\n')
		process.exit(0)
	} catch (err) {
		console.error('\nConnection check failed. ❌')
		console.error(err?.message || err)
		// Helpful hints
		console.error('\nHints:')
		console.error('- Ensure the spreadsheet is shared with the service account email (Editor)')
		console.error('- Ensure GOOGLE_PRIVATE_KEY preserves newlines (use \\n in .env)')
		console.error('- Ensure spreadsheet ID is correct and the sheet name is Sheet1')
		process.exit(2)
	}
}

main()


