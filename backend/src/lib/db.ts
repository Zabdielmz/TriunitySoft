import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { config } from './config'
import * as schema from './schema'

let database: ReturnType<typeof createDb> | null = null

function createDb() {
  const sql = neon(config.databaseUrl)
  return drizzle(sql, { schema })
}

export function getDb() {
  if (!database) database = createDb()
  return database
}

export type Database = ReturnType<typeof getDb>
export { schema }
