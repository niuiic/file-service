import z from 'zod'
import { Body, Controller, Inject, Post, Query, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { ZodValidationPipe } from '@/share/validate'
import { fileHashString, fileNameString, nil } from '@/share/schema'
import type { FileInfo } from '../service/fileInfo'
import { toFileInfo } from '../service/fileInfo'
import { FileStreamUploadService } from '../service/fileStreamUpload.service'
import { FileMultipartUploadService } from '../service/fileMultipartUpload.service'

// % controller %
@Controller('file/upload')
export class FileUploadController {
  // %% constructor %%
  constructor(
    @Inject(FileStreamUploadService)
    private readonly fileUploadService: FileStreamUploadService,
    @Inject(FileMultipartUploadService)
    private readonly fileMultipartUploadService: FileMultipartUploadService
  ) {}

  // %% uploadFileByStream %%
  @Post('stream')
  async uploadFileByStream(
    @Req() req: FastifyRequest,
    @Query('fileName', new ZodValidationPipe(fileNameString)) fileName: string,
    @Query('fileHash', new ZodValidationPipe(fileHashString.optional()))
    fileHash?: string
  ): Promise<FileInfo> {
    return this.fileUploadService
      .uploadFileByStream({
        fileData: req.raw,
        fileName,
        fileHash
      })
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
