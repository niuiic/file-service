import { Inject, Injectable } from '@nestjs/common'
import { eq, inArray, and } from 'drizzle-orm'
import type { DBSchema } from '../db/module'
import type { DB } from '../db/module'
import type { FileSchema } from '../db/schema'
import type { SnowflakeIdGenerator } from 'snowflake-id'

@Injectable()
export class FileDAO {
  constructor(
    @Inject('DB') private readonly db: DB,
    @Inject('DB_SCHEMA') private readonly schema: DBSchema,
    @Inject('ID') private readonly idGenerator: SnowflakeIdGenerator
  ) {}

  async queryFileById(id: string): Promise<FileSchema | undefined> {
    const { fileSchema } = this.schema

    return this.db
      .select()
      .from(fileSchema)
      .where(and(eq(fileSchema.id, id), eq(fileSchema.deleted, false)))
      .limit(1)
      .then((x) => x[0])
  }

  async queryFilesById(ids: string[]): Promise<FileSchema[]> {
    const { fileSchema } = this.schema

    return this.db
      .select()
      .from(fileSchema)
      .where(and(inArray(fileSchema.id, ids), eq(fileSchema.deleted, false)))
  }

  async queryFilesByHash(hash: string): Promise<FileSchema | undefined> {
    const { fileSchema } = this.schema

    return this.db
      .select()
      .from(fileSchema)
      .where(and(eq(fileSchema.hash, hash), eq(fileSchema.deleted, false)))
      .limit(1)
      .then((x) => x[0])
  }

  async hasFileWithHash(hash: string): Promise<boolean> {
    return this.queryFilesByHash(hash).then(Boolean)
  }

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
}
