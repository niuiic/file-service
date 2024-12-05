import * as schema from './schema'
import { Global, Module } from '@nestjs/common'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import type { AppConfig } from '../config/loadConfig'
import { getDBUrl } from './url'

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
            connectionString: getDBUrl(config.db),
            max: 10
          }),
          casing: 'snake_case',
          schema
        }),
      inject: ['CONFIG']
    },
    {
      provide: 'DB_SCHEMA',
      useValue: schema
    }
  ],
  exports: ['DB', 'DB_SCHEMA']
})
export class DBModule {}
