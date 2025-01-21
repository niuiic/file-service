import z from 'zod'

export const enum FileVariant {
  PngCompressed = 'PNG_COMPRESSED',
  JpegCompressed = 'JPEG_COMPRESSED'
}

export const fileVariant = z.enum(['PNG_COMPRESSED', 'JPEG_COMPRESSED'])
