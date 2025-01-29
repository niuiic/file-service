import * as schema from './schema'
import { Global, Module } from '@nestjs/common'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { getDBUrl } from './url'
import type { AppConfig } from '@/share/config'
import { Providers } from '../symbol'

export type DBSchema = typeof schema

export type DBClient = NodePgDatabase<DBSchema> & {
  $client: Pool
}

@Global()
@Module({
  providers: [
    {
      provide: Providers.DBClient,
      useFactory: (config: AppConfig) =>
        drizzle({
          client: new Pool({
            connectionString: getDBUrl(config.db),
            max: 10
          }),
          casing: 'snake_case',
          schema
        }),
      inject: [Providers.Config]
    },
    {
      provide: Providers.DBSchema,
      useValue: schema
    }
  ],
  exports: [Providers.DBClient, Providers.DBSchema]
})
export class DBModule {}
