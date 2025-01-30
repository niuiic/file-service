import type { FileSchema } from '@/modules/db/schema'
import type { TimeService } from '@/modules/time/time.service'

export type FileInfo = Pick<
  FileSchema,
  'id' | 'name' | 'size' | 'relativePath'
> & { uploadTime: string }

export const toFileInfo = (
  file: FileSchema,
  timeService: TimeService
): FileInfo => ({
  id: file.id,
  name: file.name,
  size: file.size,
  uploadTime: timeService.formatTime(file.uploadTime),
  relativePath: file.relativePath
})
