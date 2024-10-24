import {
  bigint,
  boolean,
  integer,
  timestamp,
  varchar,
  primaryKey,
  pgTable
} from 'drizzle-orm/pg-core'

export const chunks = pgTable(
  'chunks',
  {
    index: integer().notNull(),
    fileHash: varchar().notNull(),
    createTime: timestamp().notNull(),
    uploadTime: timestamp(),
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
  createTime: timestamp().notNull(),
  uploadTime: timestamp().notNull(),
  deleted: boolean().notNull()
})
