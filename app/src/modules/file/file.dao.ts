import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import type { DBSchema } from '../db/db.module'
import type { DB } from '../db/db.module'
import type { FileSchema } from '../db/schema'

@Injectable()
export class FileDAO {
  public constructor(
    @Inject('DB') private readonly db: DB,
    @Inject('DB_SCHEMA') private readonly schema: DBSchema
  ) {}

  public async queryFileById(id: string): Promise<FileSchema | undefined> {
    const { files } = this.schema

    return this.db
      .select()
      .from(files)
      .where(eq(files.id, id))
      .limit(1)
      .then((files) => files[0])
  }
}
