import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

export const db = drizzle({
  connection: process.env.DB_URL as string,
  casing: 'snake_case',
  schema
})

export type DB = typeof db
