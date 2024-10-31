import * as schema from './schema'
import { Global, Module } from '@nestjs/common'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { AppConfig } from '../config/config.module'

export type DBSchema = typeof schema

export type DB = NodePgDatabase<DBSchema> & {
  $client: Pool
}

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      useFactory: (config: AppConfig) =>
        drizzle({
          client: new Pool({
            connectionString: config.DB_URL,
            max: 10
          }),
          casing: 'snake_case',
          schema
        }),
      inject: ['CONFIG']
    },
    {
      provide: 'SCHEMA',
      useValue: schema
    }
  ],
  exports: ['DB', 'SCHEMA']
})
export class DBModule {}
