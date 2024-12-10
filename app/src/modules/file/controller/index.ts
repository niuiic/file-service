import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common'
import { ZodValidationPipe } from '@/share/validate'
import { FileService } from '../service'
import type { BatchQueryDTO } from './dto'
import { batchQueryDTO } from './dto'

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
