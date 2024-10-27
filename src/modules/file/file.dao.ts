import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DB, DBSchema } from '../db/db.module'
import { FileSchema } from '../db/schema'

@Injectable()
export class FileDao {
  public constructor(
    @Inject('DB') private readonly db: DB,
    @Inject('SCHEMA') private readonly schema: DBSchema
  ) {}

  public async queryFileById(id: string): Promise<FileSchema> {
    return this.db
      .select()
      .from(this.schema.files)
      .where((file) => eq(file.id, id))
      .limit(1)
      .then((files) => files[0])
  }
}
