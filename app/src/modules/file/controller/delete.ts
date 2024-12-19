import { idString } from '@/share/schema'
import { ZodValidationPipe } from '@/share/validate'
import { Body, Controller, Inject, Post } from '@nestjs/common'
import type z from 'zod'
import { FileService } from '../service'

// % controller %
@Controller('file/delete')
export class FileDeleteController {
  constructor(@Inject(FileService) private readonly fileService: FileService) {}

  @Post('/')
  async deleteFile(
    @Body(new ZodValidationPipe(() => fileIdDTO)) fileId: FileIdDTO
  ) {
    return deleteFile(fileId, this.fileService)
  }
}

// % deleteFile %
const deleteFile = async (fileId: FileIdDTO, fileService: FileService) => {
  return fileService.deleteFileById(fileId)
}

const fileIdDTO = idString()
type FileIdDTO = z.infer<typeof fileIdDTO>
