import { readFileSync } from 'fs'
import { parse } from 'json-bigint'
import { join } from 'path'
import { z } from 'zod'

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
  s3: z.object({
    endPoint: z.string(),
    port: z.number(),
    useSSL: z.boolean(),
    accessKey: z.string(),
    secretKey: z.string(),
    bucket: z.string()
  }),
  upload: z.object({
    maxBlobSize: z.number(),
    chunkSize: z.number()
  }),
  clusterId: z.bigint(),
  machineId: z.bigint()
})

export type AppConfig = z.infer<typeof appConfigSchema>

export const loadConfig = (configPath: string): AppConfig => {
  const config = parse(readFileSync(configPath).toString())
  config.clusterId = BigInt(config.clusterId)
  config.machineId = BigInt(config.machineId)
  return appConfigSchema.parse(config)
}

export const configPath = join(process.cwd(), 'config.json')
export const configPathMock = join(process.cwd(), 'config.mock.json')
