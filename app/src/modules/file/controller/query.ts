import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/share/validate'
import { FileService } from '../service'
import { z } from 'zod'
import { idString } from '@/share/schema'
import type { FileInfo } from './fileInfo'
import { toFileInfo } from './fileInfo'

// % controller %
@Controller('file/query')
export class FileQueryController {
  // %% constructor %%
  constructor(@Inject(FileService) private readonly fileService: FileService) {}

  // %% queryFileById %%
  @Get('single')
  async queryFileById(
    @Query('id', new ZodValidationPipe(idString())) id: string
  ): Promise<FileInfo | undefined> {
    return this.fileService
      .queryFileById(id)
      .then((x) => (x ? toFileInfo(x) : undefined))
  }

  // %% queryFilesById %%
  @Post('batch')
  async queryFilesById(
    @Body(new ZodValidationPipe(z.array(idString()))) ids: string[]
  ): Promise<FileInfo[]> {
    return this.fileService.queryFilesById(ids).then((x) => x.map(toFileInfo))
  }

  // %% isFileUploaded %%
  @Get('exist')
  async isFileUploaded(
    @Query('hash', new ZodValidationPipe(idString())) hash: string
  ): Promise<boolean> {
    return this.fileService.queryFileByHash(hash).then(Boolean)
  }
}
