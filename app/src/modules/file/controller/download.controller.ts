import { Controller, Get, Inject, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/share/validate'
import { idString } from '@/share/schema'
import type { FileVariant } from '../service/variant'
import { fileVariant } from '../service/variant'
import { FileDownloadService } from '../service/fileDownload.service'

// % controller %
@Controller('file')
export class FileDownloadController {
  // %% constructor %%
  constructor(
    @Inject(FileDownloadService)
    private readonly fileDownloadService: FileDownloadService
  ) {}

  // %% downloadFile %%
  @Get('download')
  async downloadFile(
    @Query('id', new ZodValidationPipe(idString)) id: string,
    @Query('variant', new ZodValidationPipe(fileVariant.optional()))
    variant?: FileVariant
  ) {
    return this.fileDownloadService.downloadFile(id, variant)
  }
}
