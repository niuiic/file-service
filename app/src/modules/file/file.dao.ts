import { Inject, Injectable } from '@nestjs/common'
import { eq, inArray } from 'drizzle-orm'
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
    const { fileSchema } = this.schema

    return this.db
      .select()
      .from(fileSchema)
      .where(eq(fileSchema.id, id))
      .limit(1)
      .then((x) => x[0])
  }

  public async queryFilesById(ids: string[]): Promise<FileSchema[]> {
    const { fileSchema } = this.schema

    return this.db.select().from(fileSchema).where(inArray(fileSchema.id, ids))
  }

  public async hasFileWithHash(hash: string): Promise<boolean> {
    const { fileSchema } = this.schema

    return this.db
      .select()
      .from(fileSchema)
      .where(eq(fileSchema.hash, hash))
      .limit(1)
      .then((x) => x.length > 0)
  }
}
