import type { FileSchema } from '@/modules/db/schema'
import { fileSchema } from '@/modules/db/schema'
import { IdService } from '@/modules/id/id.service'
import { Providers } from '@/modules/symbol'
import { Inject, Injectable } from '@nestjs/common'
import { and, eq, inArray, sql } from 'drizzle-orm'
import type { FileVariant } from './variant'
import type { DBClient, DBSchema } from '@/modules/db/db.module'
import { TimeService } from '@/modules/time/time.service'

// % dao %
@Injectable()
export class FilesDAO {
  // %% constructor %%
  constructor(
    @Inject(Providers.DBClient) private readonly dbClient: DBClient,
    @Inject(Providers.DBSchema) private readonly dbSchema: DBSchema,
    @Inject(IdService) private readonly idService: IdService,
    @Inject(TimeService) private readonly timeService: TimeService
  ) {}

  // %% queryFileById %%
  async queryFileById(
    id: string,
    variant?: FileVariant,
    includeExpired?: boolean
  ): Promise<FileSchema | undefined> {
    const { fileSchema } = this.dbSchema

    const files = await this.dbClient
      .select()
      .from(fileSchema)
      .where(
        and(
          eq(fileSchema.id, id),
          includeExpired ? undefined : isNotExpired(this.dbSchema)
        )
      )
      .limit(1)

    const file = files[0]
    if (!file || !variant) {
      return file
    }

    return this.dbClient
      .select()
      .from(fileSchema)
      .where(
        and(
          eq(fileSchema.origin_hash, file.hash),
          eq(fileSchema.variant, variant)
        )
      )
      .limit(1)
      .then((x) => x[0])
  }

  // %% queryFilesById %%
  async queryFilesById(ids: string[]): Promise<FileSchema[]> {
    const { fileSchema } = this.dbSchema

    return this.dbClient
      .select()
      .from(fileSchema)
      .where(and(inArray(fileSchema.id, ids), isNotExpired(this.dbSchema)))
  }

  // %% queryFilesByHash %%
  async queryFilesByHash(
    hash: string,
    variant?: FileVariant
  ): Promise<FileSchema[]> {
    const { fileSchema } = this.dbSchema

    const files = await this.dbClient
      .select()
      .from(fileSchema)
      .where(and(eq(fileSchema.hash, hash), isNotExpired(this.dbSchema)))

    if (files.length === 0 || !variant) {
      return files
    }

    return this.dbClient
      .select()
      .from(fileSchema)
      .where(
        and(eq(fileSchema.origin_hash, hash), eq(fileSchema.variant, variant))
      )
  }

  // %% queryVariantsByOriginHash %%
  async queryVariantsByOriginHash(hash: string) {
    return this.dbClient
      .select()
      .from(fileSchema)
      .where(and(eq(fileSchema.origin_hash, hash), isNotExpired(this.dbSchema)))
  }

  // %% createFile %%
  async createFile(
    file: Omit<FileSchema, 'id' | 'createTime'>
  ): Promise<FileSchema> {
    const { fileSchema } = this.dbSchema

    const newFile = {
      ...file,
      id: this.idService.generateId(),
      createTime: this.timeService.getNow()
    }

    return this.dbClient
      .insert(fileSchema)
      .values(newFile)
      .then(() => newFile)
  }

  // %% deleteFileById %%
  async deleteFileById(id: string) {
    const { fileSchema } = this.dbSchema

    return this.dbClient.delete(fileSchema).where(eq(fileSchema.id, id))
  }

  // %% queryExpiredFiles %%
  async queryExpiredFiles(): Promise<FileSchema[]> {
    const { fileSchema } = this.dbSchema

    return this.dbClient
      .select()
      .from(fileSchema)
      .where(isExpired(this.dbSchema))
  }
}

// % extract %
const isNotExpired = (dbSchema: DBSchema) => {
  const { fileSchema } = dbSchema
  return sql`${fileSchema.expiryTime} IS NULL OR ${fileSchema.expiryTime} > NOW()`
}

const isExpired = (dbSchema: DBSchema) => {
  const { fileSchema } = dbSchema
  return sql`${fileSchema.expiryTime} IS NOT NULL AND ${fileSchema.expiryTime} < NOW()`
}
