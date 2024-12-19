import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/share/validate'
import { FileService } from '../service'
import { z } from 'zod'
import { idString } from '@/share/schema'
import { toFileInfo, type FileInfo } from './fileInfo'

// % controller %
@Controller('file/query')
export class FileQueryController {
  constructor(@Inject(FileService) private readonly fileService: FileService) {}

  @Get('single')
  queryFileById(
    @Query('id', new ZodValidationPipe(() => fileIdDTO)) id: FileIdDTO
  ) {
    return queryFileById(id, this.fileService)
  }

  @Post('batch')
  queryFilesById(
    @Body(new ZodValidationPipe(() => fileIdsDTO)) ids: FileIdsDTO
  ) {
    return queryFilesById(ids, this.fileService)
  }

  @Get('exist')
  isFileUploaded(
    @Query('hash', new ZodValidationPipe(() => fileHashDTO)) hash: FileHashDTO
  ) {
    return isFileUploaded(hash, this.fileService)
  }
}

// % queryFileById %
const queryFileById = (
  id: FileIdDTO,
  fileService: FileService
): Promise<FileInfo | undefined> =>
  fileService.queryFileById(id).then((x) => (x ? toFileInfo(x) : undefined))

const fileIdDTO = idString()
type FileIdDTO = z.infer<typeof fileIdDTO>

// % queryFilesById %
const queryFilesById = (
  ids: FileIdsDTO,
  fileService: FileService
): Promise<FileInfo[] | undefined> =>
  fileService.queryFilesById(ids).then((files) => files.map(toFileInfo))

const fileIdsDTO = z.array(idString())
type FileIdsDTO = z.infer<typeof fileIdsDTO>

// % isFileUploaded %
const isFileUploaded = (hash: FileHashDTO, fileService: FileService) =>
  fileService.queryFileByHash(hash).then(Boolean)

const fileHashDTO = z.string()
type FileHashDTO = z.infer<typeof fileHashDTO>
