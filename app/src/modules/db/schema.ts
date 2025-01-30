import {
  customType,
  integer,
  timestamp,
  varchar,
  pgTable
} from 'drizzle-orm/pg-core'

const bigint = customType<{
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

export const fileSchema = pgTable('files', {
  id: bigint().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  hash: varchar({ length: 32 }).notNull(),
  size: integer().notNull(),
  relativePath: varchar({ length: 1024 }).notNull(),
  createTime: timestamp().notNull(),
  uploadTime: timestamp().notNull(),
  expiryTime: timestamp(),
  variant: varchar({ length: 32 }),
  origin_hash: varchar({ length: 32 })
})

export type FileSchema = typeof fileSchema.$inferInsert
