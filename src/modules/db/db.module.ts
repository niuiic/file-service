import { Module } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/node-postgres'

@Module({})
export class DBModule {
  private db
  private tables

  constructor() {
    this.db = drizzle({
      connection: process.env.DB_URL as string,
      casing: 'snake_case'
    })
  }
}
