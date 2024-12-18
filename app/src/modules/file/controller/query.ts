import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/share/validate'
import { FileService } from '../service'
import { z } from 'zod'
import { idString } from '@/share/schema'
import type { FileSchema } from '@/modules/db/schema'

// % controller %
@Controller('file/query')
export class FileQueryController {
  public constructor(
    @Inject(FileService) private readonly fileService: FileService
  ) {}

  @Get('single')
  public queryFileById(
    @Query('id', new ZodValidationPipe(() => fileIdDTO)) id: FileIdDTO
  ) {
    return queryFileById(id, this.fileService)
  }

  @Post('batch')
  public queryFilesById(
    @Body(new ZodValidationPipe(() => fileIdsDTO)) ids: FileIdsDTO
  ) {
    return queryFilesById(ids, this.fileService)
  }
}

// % queryFileById %
const queryFileById = (
  id: FileIdDTO,
  fileService: FileService
): Promise<FileSchema | undefined> => {
  return fileService.queryFileById(id)
}
const fileIdDTO = idString()
type FileIdDTO = z.infer<typeof fileIdDTO>

// % queryFilesById %
const queryFilesById = (
  ids: FileIdsDTO,
  fileService: FileService
): Promise<FileSchema[] | undefined> => {
  return fileService.queryFilesById(ids)
}
const fileIdsDTO = z.array(idString())
type FileIdsDTO = z.infer<typeof fileIdsDTO>
