import * as schema from './schema'
import { Global, Module } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/node-postgres'

const db = drizzle({
  connection: process.env.DB_URL as string,
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
