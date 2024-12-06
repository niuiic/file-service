import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common'
import { FileService } from './file.service'
import type { BatchQueryDTO } from './file.dto'
import { batchQueryDTO } from './file.dto'
import { ZodValidationPipe } from '@/share/validate'

@Controller('file')
export class FileController {
  public constructor(
    @Inject(FileService) private readonly fileService: FileService
  ) {}

  @Get('query/:id')
  public queryFileById(@Param('id') id: string) {
    return this.fileService.queryFileById(id)
  }

  @Post('batch-query')
  public queryFilesById(
    @Body(new ZodValidationPipe(batchQueryDTO)) ids: BatchQueryDTO
  ) {
    return this.fileService.queryFilesById(ids)
  }
}
