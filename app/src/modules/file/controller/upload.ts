import type { AppConfig } from '@/share/config'
import z from 'zod'
import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { toFileInfo, type FileInfo } from './fileInfo'
import { ZodValidationPipe } from '@/share/validate'
import type { MultipartValue } from '@fastify/multipart'
import type { FileUploadService } from '../service/upload'

// % controller %
@Controller('file/upload')
export class FileUploadController {
  // %% constructor %%
  constructor(
    @Inject('CONFIG') private config: AppConfig,
    private fileUploadService: FileUploadService
  ) {}

  // %% uploadFileByBlob %%
  @Post('blob')
  async uploadFileByBlob(@Req() req: FastifyRequest): Promise<FileInfo> {
    const file = await req.file()
    if (!file) {
      throw new BadRequestException('未收到文件')
    }

    const maxBlobSize = this.config.upload.maxBlobSize
    const fileData = await file.toBuffer()
    if (fileData.length > maxBlobSize) {
      throw new BadRequestException(
        `文件大小超过限制，最大允许上传${(maxBlobSize / 1024 / 1024).toFixed(0)}MB`
      )
    }

    const fileHash = (file.fields.fileHash as MultipartValue<string>)?.value
    if (!(typeof fileHash === 'string')) {
      throw new BadRequestException('文件hash值错误')
    }

    return this.fileUploadService
      .uploadFileByBlob(fileData, fileHash, file.filename)
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
