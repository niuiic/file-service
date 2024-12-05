import { defineConfig } from 'drizzle-kit'
import { readFileSync } from 'fs'
import { join } from 'path'

const config = JSON.parse(
  readFileSync(join(process.cwd(), 'config.json')).toString()
)

export default defineConfig({
  dialect: config.db.type,
  schema: join(process.cwd(), 'src/modules/db/schema.ts'),
  dbCredentials: {
    url: `${config.db.type}://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.database}`
  },
  casing: 'snake_case'
})
