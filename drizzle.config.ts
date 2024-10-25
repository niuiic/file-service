import './src/env'
import { defineConfig } from 'drizzle-kit'
import { join } from 'path'

export default defineConfig({
  dialect: 'postgresql',
  schema: join(process.cwd(), 'src/share/db/schema.ts'),
  dbCredentials: {
    url: process.env.DB_URL as string
  },
  casing: 'snake_case'
})
