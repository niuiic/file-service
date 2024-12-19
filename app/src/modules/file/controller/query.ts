import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/share/validate'
import { z } from 'zod'
import { idString } from '@/share/schema'
import type { FileInfo } from './fileInfo'
import { toFileInfo } from './fileInfo'
import type { FileQueryService } from '../service/query'

// % controller %
@Controller('file/query')
export class FileQueryController {
  // %% constructor %%
  constructor(private fileQueryService: FileQueryService) {}

  // %% queryFileById %%
  @Get('single')
  async queryFileById(
    @Query('id', new ZodValidationPipe(idString())) id: string
  ): Promise<FileInfo | undefined> {
    return this.fileQueryService
      .queryFileById(id)
      .then((x) => (x ? toFileInfo(x) : undefined))
  }

  // %% queryFilesById %%
  @Post('batch')
  async queryFilesById(
    @Body(new ZodValidationPipe(z.array(idString()))) ids: string[]
  ): Promise<FileInfo[]> {
    return this.fileQueryService
      .queryFilesById(ids)
      .then((x) => x.map(toFileInfo))
  }

  // %% isFileUploaded %%
  @Get('exist')
  async isFileUploaded(
    @Query('hash', new ZodValidationPipe(idString())) hash: string
  ): Promise<boolean> {
    return this.fileQueryService.queryFileByHash(hash).then(Boolean)
  }
}
