import * as schema from './schema'
import { Global, Module } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const db = drizzle({
  client: new Pool({
    connectionString: process.env.DB_URL as string,
    max: 10
  }),
  casing: 'snake_case',
  schema
})

export type DB = typeof db

export type DBSchema = typeof schema

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      useValue: db
    },
    {
      provide: 'SCHEMA',
      useValue: schema
    }
  ],
  exports: ['DB', 'SCHEMA']
})
export class DBModule {}
