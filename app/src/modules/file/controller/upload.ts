import z from 'zod'
import { Body, Controller, Inject, Post, Query, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { toFileInfo, type FileInfo } from './fileInfo'
import { ZodValidationPipe } from '@/share/validate'
import { FileUploadService } from '../service/upload'
import { fileHashString, fileNameString, nil } from '@/share/schema'

// % controller %
@Controller('file/upload')
export class FileUploadController {
  // %% constructor %%
  constructor(
    @Inject(FileUploadService)
    private readonly fileUploadService: FileUploadService
  ) {}

  // %% uploadFileByStream %%
  @Post('stream')
  async uploadFileByStream(
    @Req() req: FastifyRequest,
    @Query('fileName', new ZodValidationPipe(fileNameString)) fileName: string,
    @Query('fileHash', new ZodValidationPipe(fileHashString.or(nil)))
    fileHash?: string
  ): Promise<FileInfo> {
    return this.fileUploadService
      .uploadFileByStream(req.raw, fileName, fileHash)
      .then(toFileInfo)
  }

  // %% uploadFileByHash %%
  @Post('hash')
  async uploadFileByHash(
    @Body(new ZodValidationPipe(FileUploadController.fileInfoDTO))
    fileInfo: z.infer<typeof FileUploadController.fileInfoDTO>
  ) {
    return this.fileUploadService
      .uploadFileByHash({
        fileHash: fileInfo.fileHash,
        fileName: fileInfo.fileName
      })
      .then(toFileInfo)
  }
  private static fileInfoDTO = z.object({
    fileHash: z.string(),
    fileName: z.string()
  })
}
