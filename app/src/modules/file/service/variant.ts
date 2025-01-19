import z from 'zod'

export const enum FileVariant {
  ImageCompressed = 'IMAGE_COMPRESSED'
}

export const fileVariant = z.enum(['IMAGE_COMPRESSED'])
