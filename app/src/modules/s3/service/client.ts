import type { AppConfig } from '@/share/config'
import { Client } from 'minio'

export const newClient = async (config: AppConfig) => {
  const client = new Client({
    endPoint: config.s3.endPoint,
    accessKey: config.s3.accessKey,
    secretKey: config.s3.secretKey,
    useSSL: config.s3.useSSL,
    port: config.s3.port
  })

  if (!(await client.bucketExists(config.s3.bucket))) {
    await client.makeBucket(config.s3.bucket)
  }

  return client
}

export type S3Client = Client
