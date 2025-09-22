import { type ConnectorService, type ConnectedSourceConfig, type ExternalSchemaDefinition } from "./connector"

// Minimal placeholder to keep SOLID boundaries; implement later with Google API
export class GoogleSheetsConnector implements ConnectorService {
  async readSchema(config: ConnectedSourceConfig): Promise<ExternalSchemaDefinition> {
    void config
    return { version: 1, fields: [] }
  }

  async readRows(config: ConnectedSourceConfig): Promise<Record<string, unknown>[]> {
    void config
    return []
  }

  async appendRow(config: ConnectedSourceConfig, row: Record<string, unknown>): Promise<{ externalRowId: string }> {
    void config
    void row
    return { externalRowId: "pending-impl" }
  }

  async updateRow(config: ConnectedSourceConfig, externalRowId: string, row: Record<string, unknown>): Promise<void> {
    void config
    void externalRowId
    void row
  }

  async deleteRow(config: ConnectedSourceConfig, externalRowId: string): Promise<void> {
    void config
    void externalRowId
  }
}


