import { idString } from '@/share/schema'
import { ZodValidationPipe } from '@/share/validate'
import { Body, Controller, Inject, Post } from '@nestjs/common'
import { FileService } from '../service'

// % controller %
@Controller('file/delete')
export class FileDeleteController {
  // %% constructor %%
  constructor(@Inject(FileService) private readonly fileService: FileService) {}

  // %% deleteFile %%
  @Post('/')
  async deleteFile(@Body(new ZodValidationPipe(idString())) fileId: string) {
    return this.fileService.deleteFileById(fileId)
  }
}
