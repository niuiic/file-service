import z from 'zod'

export const idString = z
  .string()
  .refine((x) => x.match(/^[\d]+$/), 'id is invalid')

export const fileNameString = z.string().min(1).max(255)

export const fileHashString = z.string().min(1).max(32)

export const numberString = z
  .string()
  .refine((x) => x.match(/^[\d]+$/), 'it is not a number')
