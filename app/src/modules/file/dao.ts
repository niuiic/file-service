import { Inject, Injectable } from '@nestjs/common'
import { eq, inArray } from 'drizzle-orm'
import type { DBSchema } from '../db/module'
import type { DB } from '../db/module'
import { fileSchema, type FileSchema } from '../db/schema'
import type { SnowflakeIdGenerator } from 'snowflake-id'

// % dao %
@Injectable()
export class FileDAO {
  // %% constructor %%
  constructor(
    @Inject('DB') private db: DB,
    @Inject('DB_SCHEMA') private schema: DBSchema,
    @Inject('ID') private idGenerator: SnowflakeIdGenerator
  ) {}

  // %% queryFileById %%
  async queryFileById(id: string): Promise<FileSchema | undefined> {
    const { fileSchema } = this.schema

    return this.db
      .select()
      .from(fileSchema)
      .where(eq(fileSchema.id, id))
      .limit(1)
      .then((x) => x[0])
  }

  // %% queryFilesById %%
  async queryFilesById(ids: string[]): Promise<FileSchema[]> {
    const { fileSchema } = this.schema

    return this.db.select().from(fileSchema).where(inArray(fileSchema.id, ids))
  }

  // %% queryFilesByHash %%
  async queryFilesByHash(hash: string): Promise<FileSchema[]> {
    const { fileSchema } = this.schema

    return this.db.select().from(fileSchema).where(eq(fileSchema.hash, hash))
  }

  // %% hasFileWithHash %%
  async hasFileWithHash(hash: string): Promise<boolean> {
    return this.db
      .select()
      .from(fileSchema)
      .where(eq(fileSchema.hash, hash))
      .limit(1)
      .then((x) => x.length > 0)
  }

  // %% createFile %%
  async createFile(
    file: Omit<FileSchema, 'id' | 'createTime'>
  ): Promise<FileSchema> {
    const { fileSchema } = this.schema

    const newFile = {
      ...file,
      id: this.idGenerator.getId(),
      createTime: new Date()
    }

    return this.db
      .insert(fileSchema)
      .values(newFile)
      .then(() => newFile)
  }

  // %% deleteFileById %%
  async deleteFileById(id: string) {
    const { fileSchema } = this.schema

    return this.db.delete(fileSchema).where(eq(fileSchema.id, id))
  }
}
