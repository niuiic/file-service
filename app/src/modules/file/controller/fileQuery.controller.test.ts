import { assert, beforeAll, describe, test } from 'vitest'
import { Test } from '@nestjs/testing'
import { FileQueryController } from './fileQuery.controller'
import { AppModule } from '@/app.module'
import type { DBClient, DBSchema } from '@/modules/db/module'
import { Providers } from '@/modules/symbol'

describe('file query controller', () => {
  let controller: FileQueryController
  let dbClient: DBClient
  let dbSchema: DBSchema

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule.forRoot(true)]
    }).compile()
    controller = moduleRef.get(FileQueryController)
    dbClient = moduleRef.get(Providers.DBClient)
    dbSchema = moduleRef.get(Providers.DBSchema)
  })

  // %% queryFileById %%
  test('queryFileById', async () => {
    const { fileSchema } = dbSchema
    const files = await dbClient.select().from(fileSchema)
    if (files.length === 0) {
      return
    }

    await controller.queryFileById(files[0].id).then((x) => {
      assert(x)
      assert(x.relativePath === files[0].relativePath)
    })
  })
})
