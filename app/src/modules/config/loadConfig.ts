import { readFileSync } from 'fs'
import { join } from 'path'
import { parse } from 'json-bigint'
import { z } from 'zod'
import { isMockMode } from '@/share/mode'

const appConfigSchema = z.object({
  db: z.object({
    type: z.string(),
    host: z.string(),
    port: z.number(),
    username: z.string(),
    password: z.string(),
    database: z.string()
  }),
  cache: z.object({
    type: z.string(),
    host: z.string(),
    port: z.number(),
    username: z.string(),
    password: z.string(),
    db: z.number()
  }),
  clusterId: z.bigint(),
  machineId: z.bigint()
})

export type AppConfig = z.infer<typeof appConfigSchema>

export const loadConfig = (): AppConfig => {
  const config = parse(
    readFileSync(
      join(process.cwd(), isMockMode() ? 'config.mock.json' : 'config.json')
    ).toString()
  )
  config.clusterId = BigInt(config.clusterId)
  config.machineId = BigInt(config.machineId)
  return appConfigSchema.parse(config)
}
