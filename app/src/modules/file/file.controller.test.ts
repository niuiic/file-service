import { beforeEach, describe, expect, it } from 'vitest'
import { Test } from '@nestjs/testing'
import { FileDAO } from './file.dao'
import { FileService } from './file.service'
import { FileController } from './file.controller'
import { DBModule } from '../db/db.module'
import { ConfigModule } from '../config/config.module'
import { configPathMock } from '@/share/config'

describe('file controller', () => {
  let fileController: FileController

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DBModule, ConfigModule.forRoot(configPathMock)],
      controllers: [FileController],
      providers: [FileDAO, FileService]
    }).compile()
    fileController = moduleRef.get(FileController)
  })

  it('test', () =>
    fileController.queryFileById('188273635378734612').then((x) => {
      expect(x).not.toBeUndefined()
    }))
})
