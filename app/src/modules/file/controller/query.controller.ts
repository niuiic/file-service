import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/share/validate'
import { z } from 'zod'
import { idString } from '@/share/schema'
import type { FileInfo } from './fileInfo'
import { FileQueryService } from '../service/fileQuery.service'
import type { FileVariant } from '../service/variant'
import { fileVariant } from '../service/variant'

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
    return this.fileQueryService.queryFileInfo(id)
  }

  // %% queryFilesById %%
  @Post('batch')
  async queryFilesById(
    @Body(new ZodValidationPipe(z.array(idString))) ids: string[]
  ): Promise<FileInfo[]> {
    return this.fileQueryService.queryFilesInfo(ids)
  }

  // %% isFileUploaded %%
  @Get('exist')
  async isFileUploaded(
    @Query('hash', new ZodValidationPipe(idString)) hash: string,
    @Query('variant', new ZodValidationPipe(fileVariant))
    variant: FileVariant
  ): Promise<boolean> {
    return this.fileQueryService.isFileUploaded(hash, variant)
  }
}
