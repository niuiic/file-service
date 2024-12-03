import { Global, Module } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'

export interface AppConfig {
  DB_URL: string
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
