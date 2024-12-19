import type { FileSchema } from '@/modules/db/schema'
import { pick } from '@/share/pick'

export type FileInfo = Pick<
  FileSchema,
  'id' | 'name' | 'size' | 'uploadTime' | 'relativePath'
>

export const toFileInfo = (file: FileSchema): FileInfo =>
  pick(file, ['id', 'name', 'size', 'uploadTime', 'relativePath'])
