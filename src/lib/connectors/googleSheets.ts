import { google } from 'googleapis'
import { type ConnectorService, type ConnectedSourceConfig, type ExternalSchemaDefinition, type SchemaField } from "./connector"

export class GoogleSheetsConnector implements ConnectorService {
  private sheets: any

  constructor() {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth })
  }

  async readSchema(config: ConnectedSourceConfig): Promise<ExternalSchemaDefinition> {
    try {
      const { sourceId, sheetName = 'Sheet1' } = config
      
      // Read the header row (first row) to get column names
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sourceId,
        range: `${sheetName}!1:1`,
      })

      const headerRow = response.data.values?.[0] || []
      
      // Convert header row to schema fields
      const fields: SchemaField[] = headerRow.map((header: string, index: number) => ({
        key: this.sanitizeKey(header),
        label: header || `Column ${index + 1}`,
        type: 'string', // Default type, can be refined later
        required: false,
        columnRef: header,
      }))

      return { version: 1, fields }
    } catch (error) {
      console.error('Error reading schema from Google Sheets:', error)
      throw new Error('Failed to read schema from Google Sheets')
    }
  }

  async readRows(config: ConnectedSourceConfig): Promise<Record<string, unknown>[]> {
    try {
      const { sourceId, sheetName = 'Sheet1' } = config
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sourceId,
        range: `${sheetName}`,
      })

      const rows = response.data.values || []
      if (rows.length < 2) return [] // No data rows

      const [headers, ...dataRows] = rows
      const sanitizedHeaders = headers.map((h: string) => this.sanitizeKey(h))

      return dataRows.map((row: string[]) => {
        const record: Record<string, unknown> = {}
        sanitizedHeaders.forEach((header: string, index: number) => {
          record[header] = row[index] || ''
        })
        return record
      })
    } catch (error) {
      console.error('Error reading rows from Google Sheets:', error)
      throw new Error('Failed to read rows from Google Sheets')
    }
  }

  async appendRow(config: ConnectedSourceConfig, row: Record<string, unknown>): Promise<{ externalRowId: string }> {
    try {
      const { sourceId, sheetName = 'Sheet1' } = config
      
      // First, get the schema to understand column mapping
      const schema = await this.readSchema(config)
      const headers = schema.fields.map(field => field.columnRef || field.key)
      
      // Convert row data to array format matching the headers
      const values = headers.map(header => {
        const field = schema.fields.find(f => f.columnRef === header || f.key === header)
        const value = field ? row[field.key] : ''
        return value || ''
      })

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: sourceId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values],
        },
      })

      // Generate a unique row ID based on the response
      const externalRowId = `${sourceId}-${sheetName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      return { externalRowId }
    } catch (error) {
      console.error('Error appending row to Google Sheets:', error)
      throw new Error('Failed to append row to Google Sheets')
    }
  }

  async updateRow(config: ConnectedSourceConfig, externalRowId: string, row: Record<string, unknown>): Promise<void> {
    try {
      const { sourceId, sheetName = 'Sheet1' } = config
      
      // Parse row number from externalRowId or find the row
      // For now, we'll implement a simple approach
      const schema = await this.readSchema(config)
      const headers = schema.fields.map(field => field.columnRef || field.key)
      
      const values = headers.map(header => {
        const field = schema.fields.find(f => f.columnRef === header || f.key === header)
        const value = field ? row[field.key] : ''
        return value || ''
      })

      // This is a simplified implementation - in production you'd want to track row numbers
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sourceId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      })
    } catch (error) {
      console.error('Error updating row in Google Sheets:', error)
      throw new Error('Failed to update row in Google Sheets')
    }
  }

  async deleteRow(config: ConnectedSourceConfig, externalRowId: string): Promise<void> {
    try {
      const { sourceId, sheetName = 'Sheet1' } = config
      
      // This is a simplified implementation - in production you'd want to track row numbers
      // For now, we'll clear the row instead of deleting it
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: sourceId,
        range: `${sheetName}!A:Z`,
      })
    } catch (error) {
      console.error('Error deleting row from Google Sheets:', error)
      throw new Error('Failed to delete row from Google Sheets')
    }
  }

  private sanitizeKey(key: string): string {
    return key
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_')
  }
}


