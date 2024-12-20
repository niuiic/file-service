import { Controller, Get, Inject, Param, Redirect } from '@nestjs/common'
import { FileQueryService } from '../service/query'
import { ZodValidationPipe } from '@/share/validate'
import { idString } from '@/share/schema'

// % controller %
@Controller('file/download')
export class FileDownloadController {
  // %% constructor %%
  constructor(
    @Inject(FileQueryService) private fileQueryService: FileQueryService
  ) {}

  // %% downloadFile %%
  @Get(':id')
  @Redirect()
  async downloadFile(
    @Param('id', new ZodValidationPipe(idString())) id: string
  ) {
    const url = await this.fileQueryService.queryFileUrlById(id)
    return { url }
  }
}
