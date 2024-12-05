import { getDBUrl } from '@/modules/db/url'
import { loadConfig } from '@/share/config'
import { defineConfig } from 'drizzle-kit'
import { join } from 'path'

const config = loadConfig()

export default defineConfig({
  dialect: config.db.type as any,
  schema: join(process.cwd(), 'src/modules/db/schema.ts'),
  dbCredentials: { url: getDBUrl(config.db) },
  casing: 'snake_case'
})
