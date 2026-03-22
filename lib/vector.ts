import path from 'path';
import * as lancedb from 'vectordb';

const DB_DIR = path.join(process.cwd(), 'rag-db');
const TABLE_NAME = 'documents';

export type StoredDocument = {
  id: string;
  vector: number[];
  text: string;
  source: string;
};

interface LanceDBQuery {
  limit: (n: number) => LanceDBQuery;
  execute: () => Promise<StoredDocument[]>;
}

interface LanceDBTable {
  add: (data: StoredDocument[]) => Promise<void>;
  search: (vector: number[]) => LanceDBQuery;
  filter: (predicate: string) => LanceDBQuery;
  delete: (predicate: string) => Promise<void>;
}

interface LanceDBConnection {
  tableNames: () => Promise<string[]>;
  openTable: (name: string) => Promise<LanceDBTable>;
  createTable: (name: string, data: StoredDocument[]) => Promise<LanceDBTable>;
}

async function getDb(): Promise<LanceDBConnection> {
  // LanceDB automatically creates the directory if it does not exist
  return await lancedb.connect(DB_DIR) as unknown as LanceDBConnection;
}

export async function addDocuments(documents: StoredDocument[]) {
  if (!documents.length) return;

  const db = await getDb();
  const tables = await db.tableNames();

  if (tables.includes(TABLE_NAME)) {
    const table = await db.openTable(TABLE_NAME) as LanceDBTable;
    await table.add(documents);
    return;
  }

  // First time: create table with initial documents so schema is inferred
  await db.createTable(TABLE_NAME, documents);
}

export async function searchDocuments(
  vector: number[],
  limit = 4,
): Promise<StoredDocument[]> {
  const db = await getDb();
  const tables = await db.tableNames();

  if (!tables.includes(TABLE_NAME)) {
    // No documents have been added yet
    return [];
  }

  const table = await db.openTable(TABLE_NAME) as LanceDBTable;
  const query = table.search(vector).limit(limit);
  const results = await query.execute();

  return results;
}

export async function listDocuments(
  limit = 100,
): Promise<StoredDocument[]> {
  const db = await getDb();
  const tables = await db.tableNames();

  if (!tables.includes(TABLE_NAME)) {
    return [];
  }

  const table = await db.openTable(TABLE_NAME) as LanceDBTable;
  // Fetch up to `limit` rows; filter ensures we get any row with a non-null id
  const query = table.filter('id IS NOT NULL').limit(limit);
  const results = await query.execute();
  return results as StoredDocument[];
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await getDb();
  const tables = await db.tableNames();

  if (!tables.includes(TABLE_NAME)) {
    return;
  }

  const table = await db.openTable(TABLE_NAME) as LanceDBTable;
  // Use SQL-style predicate to delete by id
  // Escape single quotes in id to avoid breaking the predicate
  const safeId = id.replace(/'/g, "''");
  await table.delete(`id = '${safeId}'`);
}

export async function deleteAllDocuments(): Promise<void> {
  const db = await getDb();
  const tables = await db.tableNames();

  if (!tables.includes(TABLE_NAME)) {
    return;
  }

  const table = await db.openTable(TABLE_NAME) as LanceDBTable;
  // Delete all rows; predicate must not be empty, so use a tautology
  await table.delete('1 = 1');
}


