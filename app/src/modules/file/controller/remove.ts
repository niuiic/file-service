import { idString } from '@/share/schema'
import { ZodValidationPipe } from '@/share/validate'
import { Body, Controller, Inject, Post } from '@nestjs/common'
import type z from 'zod'
import { FileService } from '../service'

// % controller %
@Controller('file/remove')
export class FileRemoveController {
  constructor(@Inject(FileService) private readonly fileService: FileService) {}

  @Post('/')
  async removeFile(
    @Body(new ZodValidationPipe(() => fileIdDTO)) fileId: FileIdDTO
  ) {
    return removeFile(fileId, this.fileService)
  }
}

// % removeFile %
const removeFile = async (fileId: FileIdDTO, fileService: FileService) => {
  return fileService.removeFileById(fileId)
}

const fileIdDTO = idString()
type FileIdDTO = z.infer<typeof fileIdDTO>
