import { Controller, Get, Inject, Query, Res } from '@nestjs/common'
import { ZodValidationPipe } from '@/share/validate'
import { idString } from '@/share/schema'
import type { FileVariant } from '../service/variant'
import { fileVariant } from '../service/variant'
import { FileDownloadService } from '../service/fileDownload.service'
import type { FastifyReply } from 'fastify'

// % controller %
@Controller('file/download')
export class FileDownloadController {
  // %% constructor %%
  constructor(
    @Inject(FileDownloadService)
    private readonly fileDownloadService: FileDownloadService
  ) {}

  // %% downloadFile %%
  @Get('/')
  async downloadFile(
    @Res()
    res: FastifyReply,
    @Query('id', new ZodValidationPipe(idString)) id: string,
    @Query('variant', new ZodValidationPipe(fileVariant.optional()))
    variant?: FileVariant
  ) {
    const fileData = await this.fileDownloadService.downloadFile(id, variant)
    res.header('Content-Type', 'application/octet-stream').send(fileData)
  }
}
