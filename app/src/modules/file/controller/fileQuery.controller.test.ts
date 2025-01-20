import { beforeAll, describe, test } from 'vitest'
import { Test } from '@nestjs/testing'
import { FileQueryController } from './fileQuery.controller'
import { AppModule } from '@/app.module'

describe('file query controller', () => {
  let controller: FileQueryController

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule.forRoot(true)]
    }).compile()
    controller = moduleRef.get(FileQueryController)
  })

  // %% queryFileById %%
  test('queryFileById', () => controller.queryFileById('188273635378734612'))
})
