import type { AppConfig } from '@/share/config'
import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  Req
} from '@nestjs/common'
import { FileService } from '../service'
import type { FastifyRequest } from 'fastify'

// % controller %
@Controller('file/upload')
export class FileUploadController {
  constructor(
    @Inject('CONFIG') private readonly config: AppConfig,
    @Inject(FileService) private readonly fileService: FileService
  ) {}

  @Post('blob')
  async uploadFileByBlob(@Req() req: FastifyRequest) {
    return uploadFileByBlob(
      req,
      this.fileService,
      this.config.upload.maxBlobSize
    )
  }
}

// % uploadFileByBlob %
const uploadFileByBlob = async (
  req: FastifyRequest,
  fileService: FileService,
  maxBlobSize: number
) => {
  const file = await req.file()
  if (!file) {
    throw new BadRequestException('未收到文件')
  }

  const buffer = await file.toBuffer()
  if (buffer.length > maxBlobSize) {
    throw new BadRequestException(
      `文件大小超过限制，最大允许上传${(maxBlobSize / 1024 / 1024).toFixed(0)}MB`
    )
  }

  const fileHash = file.fields.fileHash
  if (!(typeof fileHash === 'string')) {
    throw new BadRequestException('文件hash值错误')
  }

  return fileService.uploadFileByBlob(buffer, fileHash, file.filename)
}
