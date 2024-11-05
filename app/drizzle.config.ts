import './src/env'
import { defineConfig } from 'drizzle-kit'
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  dialect: 'postgresql',
  schema: join(process.cwd(), 'src/modules/db/schema.ts'),
  dbCredentials: {
    url: JSON.parse(readFileSync(join(process.cwd(), 'config.json')).toString())
      .DB_URL
  },
  casing: 'snake_case'
})
