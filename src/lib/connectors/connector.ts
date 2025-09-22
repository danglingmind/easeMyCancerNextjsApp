export type FieldType = "string" | "number" | "date" | "boolean" | "enum" | "file";

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  validationRules?: Record<string, unknown>;
  columnRef?: string; // e.g., header name or column letter
  enumOptions?: string[];
}

export interface ExternalSchemaDefinition {
  version: number;
  fields: SchemaField[];
}

export interface ConnectedSourceConfig {
  id: string;
  type: "google-sheets" | "database";
  sourceId: string; // spreadsheetId, etc.
  sheetName?: string;
}

export interface ConnectorService {
  readSchema(config: ConnectedSourceConfig): Promise<ExternalSchemaDefinition>;
  readRows(config: ConnectedSourceConfig): Promise<Record<string, unknown>[]>;
  appendRow(
    config: ConnectedSourceConfig,
    row: Record<string, unknown>
  ): Promise<{ externalRowId: string }>;
  updateRow(
    config: ConnectedSourceConfig,
    externalRowId: string,
    row: Record<string, unknown>
  ): Promise<void>;
  deleteRow(config: ConnectedSourceConfig, externalRowId: string): Promise<void>;
}


