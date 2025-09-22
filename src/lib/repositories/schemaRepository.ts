import { getDatabase } from "@/lib/mongodb"
import { type SchemaField } from "@/lib/connectors/connector"

export interface SchemaDefinitionDoc {
  _id?: string
  connectedSourceId: string
  version: number
  fields: SchemaField[]
  createdBy: string
  createdAt: string
}

export class SchemaRepository {
  private readonly collectionName = "schema_definitions"

  async getLatestBySource(connectedSourceId: string): Promise<SchemaDefinitionDoc | null> {
    const db = await getDatabase()
    const doc = await db
      .collection<SchemaDefinitionDoc>(this.collectionName)
      .find({ connectedSourceId })
      .sort({ version: -1 })
      .limit(1)
      .next()
    return doc ?? null
  }

  async create(def: Omit<SchemaDefinitionDoc, "_id">): Promise<SchemaDefinitionDoc> {
    const db = await getDatabase()
    const result = await db.collection<SchemaDefinitionDoc>(this.collectionName).insertOne(def)
    return { ...def, _id: result.insertedId.toString() }
  }
}


