import { z } from 'zod'

export const batchQueryDTO = z.array(z.string())
export type BatchQueryDTO = z.infer<typeof batchQueryDTO>
