import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/share/validate'
import { z } from 'zod'
import { fileHashString, idString } from '@/share/schema'
import { FileQueryService } from '../service/fileQuery.service'
import type { FileVariant } from '../service/variant'
import { fileVariant } from '../service/variant'
import { toFileInfo, type FileInfo } from './fileInfo'

// % controller %
@Controller('file/query')
export class FileQueryController {
  // %% constructor %%
  constructor(
    @Inject(FileQueryService)
    private readonly fileQueryService: FileQueryService
  ) {}

  // %% queryFileById %%
  @Get('single')
  async queryFileById(
    @Query('id', new ZodValidationPipe(idString)) id: string
  ): Promise<FileInfo | undefined> {
    return this.fileQueryService.queryFileInfo(id).then(toFileInfo)
  }

  // %% queryFilesById %%
  @Post('batch')
  async queryFilesById(
    @Body(new ZodValidationPipe(z.array(idString))) ids: string[]
  ): Promise<FileInfo[]> {
    return this.fileQueryService
      .queryFilesInfo(ids)
      .then((x) => x.map(toFileInfo))
  }

  // %% isFileUploaded %%
  @Get('exist')
  async isFileUploaded(
    @Query('hash', new ZodValidationPipe(fileHashString)) hash: string,
    @Query('variant', new ZodValidationPipe(fileVariant.optional()))
    variant?: FileVariant
  ): Promise<boolean> {
    return this.fileQueryService.isFileUploaded(hash, variant)
  }
}
