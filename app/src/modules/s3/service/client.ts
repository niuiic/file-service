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

  if (!(await isBucketPublic(client, config.s3.bucket))) {
    await setBucketToPublic(client, config.s3.bucket)
  }

  return client
}

export type S3Client = Client

const isBucketPublic = (client: Client, bucket: string) =>
  client
    .getBucketPolicy(bucket)
    .then(
      (policy) =>
        policy.includes('"Effect":"Allow"') &&
        policy.includes('"Principal":"*"') &&
        policy.includes('"Action":"s3:GetObject"')
    )
    .catch(() => false)

const setBucketToPublic = (client: Client, bucket: string) => {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: [`arn:aws:s3:::${bucket}/*`]
      }
    ]
  }

  return client.setBucketPolicy(bucket, JSON.stringify(policy))
}
