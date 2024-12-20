import {
  boolean,
  customType,
  integer,
  timestamp,
  varchar,
  primaryKey,
  pgTable
} from 'drizzle-orm/pg-core'

const customBigint = customType<{
  data: string
  driverData: bigint
}>({
  dataType() {
    return 'bigint'
  },
  toDriver(value: string) {
    return BigInt(value)
  },
  fromDriver(value: bigint) {
    return value.toString()
  }
})

export const chunkSchema = pgTable(
  'chunks',
  {
    index: integer().notNull(),
    fileHash: varchar().notNull(),
    createTime: timestamp({ withTimezone: true }).notNull(),
    uploadTime: timestamp({ withTimezone: true }),
    uploaded: boolean().notNull()
  },
  (table) => [{ pk: primaryKey({ columns: [table.index, table.fileHash] }) }]
)

export type ChunkSchema = typeof chunkSchema.$inferInsert

export const fileSchema = pgTable('files', {
  id: customBigint().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  hash: varchar({ length: 32 }).notNull(),
  size: integer().notNull(),
  createTime: timestamp({ withTimezone: true }).notNull(),
  uploadTime: timestamp({ withTimezone: true }).notNull(),
  relativePath: varchar({ length: 1024 }).notNull()
})

export type FileSchema = typeof fileSchema.$inferInsert
