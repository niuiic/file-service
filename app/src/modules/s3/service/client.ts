import type { AppConfig } from '@/share/config'
import {
  CreateBucketCommand,
  GetBucketPolicyStatusCommand,
  HeadBucketCommand,
  PutBucketAclCommand,
  S3Client
} from '@aws-sdk/client-s3'
import assert from 'assert'

export const newClient = async (config: AppConfig) => {
  const client = new S3Client({
    region: config.s3.region,
    endpoint: config.s3.endPoint,
    credentials: {
      accessKeyId: config.s3.accessKey,
      secretAccessKey: config.s3.secretKey
    },
    forcePathStyle: config.s3.forcePathStyle
  })

  await validateBucketExists(client, config.s3.bucket).catch(() =>
    createBucket(client, config.s3.bucket)
  )

  await validateBucketIsPublic(client, config.s3.bucket).catch(() =>
    makeBucketPublic(client, config.s3.bucket)
  )

  return client
}

const validateBucketExists = async (client: S3Client, bucket: string) =>
  client.send(new HeadBucketCommand({ Bucket: bucket }))

const createBucket = async (client: S3Client, bucket: string) =>
  client.send(new CreateBucketCommand({ Bucket: bucket }))

const validateBucketIsPublic = async (client: S3Client, bucket: string) =>
  client
    .send(new GetBucketPolicyStatusCommand({ Bucket: bucket }))
    .then((x) => assert(x.PolicyStatus?.IsPublic))

const makeBucketPublic = async (client: S3Client, bucket: string) =>
  client.send(
    new PutBucketAclCommand({
      Bucket: bucket,
      ACL: 'public-read'
    })
  )

