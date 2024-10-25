import {
  bigint,
  boolean,
  integer,
  varchar,
  primaryKey,
  pgTable,
  time
} from 'drizzle-orm/pg-core'

export const chunks = pgTable(
  'chunks',
  {
    index: integer().notNull(),
    fileHash: varchar().notNull(),
    createTime: time().notNull(),
    uploadTime: time(),
    uploaded: boolean().notNull(),
    deleted: boolean().notNull()
  },
  (table) => ({ pk: primaryKey({ columns: [table.index, table.fileHash] }) })
)

export const files = pgTable('files', {
  id: bigint({ mode: 'bigint' }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  hash: varchar({ length: 32 }).notNull(),
  size: integer().notNull(),
  createTime: time().notNull(),
  uploadTime: time().notNull(),
  deleted: boolean().notNull()
})
