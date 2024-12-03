import { Global, Module } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'

export interface AppConfig {
  db: {
    type: 'postgresql'
    host: string
    port: number
    username: string
    password: string
    database: string
  }
  cache: {
    type: 'redis'
    host: string
    port: number
    username: string
    password: string
    db: number
  }
}

@Global()
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: JSON.parse(
        readFileSync(join(process.cwd(), 'config.json')).toString()
      )
    }
  ],
  exports: ['CONFIG']
})
export class ConfigModule {}
