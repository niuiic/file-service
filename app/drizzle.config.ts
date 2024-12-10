import { getDBUrl } from '@/modules/db/url'
import { configPath, configPathMock, loadConfig } from '@/share/config'
import { isMockMode } from '@/share/mode'
import { defineConfig } from 'drizzle-kit'
import { join } from 'path'

const config = loadConfig(isMockMode() ? configPathMock : configPath)

export default defineConfig({
  dialect: config.db.type as any,
  schema: join(process.cwd(), 'src/modules/db/schema.ts'),
  dbCredentials: { url: getDBUrl(config.db) },
  casing: 'snake_case'
})
