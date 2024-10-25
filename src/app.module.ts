import { Module } from '@nestjs/common'
import { FileModule } from './modules/file/file.module'
import { db } from './share/db/db'

@Module({
  imports: [FileModule],
  providers: [
    {
      provide: 'DB',
      useValue: db
    }
  ]
})
export class AppModule {}
