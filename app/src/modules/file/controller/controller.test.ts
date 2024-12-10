import { beforeEach, describe, expect, it } from 'vitest'
import { Test } from '@nestjs/testing'
import { configPathMock } from '@/share/config'
import { ConfigModule } from '@/modules/config/module'
import { DBModule } from '@/modules/db/module'
import { FileController } from '.'
import { FileDAO } from '../dao'
import { FileService } from '../service'

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
