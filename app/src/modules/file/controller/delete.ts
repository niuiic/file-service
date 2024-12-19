import { idString } from '@/share/schema'
import { ZodValidationPipe } from '@/share/validate'
import { Body, Controller, Post } from '@nestjs/common'
import type { FileDeleteService } from '../service/delete'

// % controller %
@Controller('file/delete')
export class FileDeleteController {
  // %% constructor %%
  constructor(private readonly fileDeleteService: FileDeleteService) {}

  // %% deleteFile %%
  @Post('/')
  async deleteFile(@Body(new ZodValidationPipe(idString())) fileId: string) {
    return this.fileDeleteService.deleteFileById(fileId)
  }
}
