import z from 'zod'
import { Body, Controller, Inject, Post, Query, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { ZodValidationPipe } from '@/share/validate'
import { fileHashString, fileNameString, numberString } from '@/share/schema'
import { FileStreamUploadService } from '../service/fileStreamUpload.service'
import { FileMultipartUploadService } from '../service/fileMultipartUpload.service'
import type { FileInfo } from './fileInfo'
import { toFileInfo } from './fileInfo'
import type { FileVariant } from '../service/variant'
import { fileVariant } from '../service/variant'

// % controller %
@Controller('file')
export class FileUploadController {
  // %% constructor %%
  constructor(
    @Inject(FileStreamUploadService)
    private readonly fileUploadService: FileStreamUploadService,
    @Inject(FileMultipartUploadService)
    private readonly fileMultipartUploadService: FileMultipartUploadService
  ) {}

  // %% uploadFileByStream %%
  @Post('upload/stream')
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
  @Post('upload/hash')
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

  // %% requestFileChunks %%
  @Post('chunk/request')
  async requestFileChunks(
    @Body(new ZodValidationPipe(FileUploadController.requestFileChunksDTO))
    data: z.infer<typeof FileUploadController.requestFileChunksDTO>
  ) {
    return this.fileMultipartUploadService.requestFileChunks(
      data.fileHash,
      data.fileName,
      data.fileSize
    )
  }
  private static requestFileChunksDTO = z.object({
    fileHash: z.string(),
    fileName: z.string(),
    fileSize: z.number()
  })

  // %% uploadFileChunks %%
  @Post('chunk/upload')
  async uploadFileChunks(
    @Req() req: FastifyRequest,
    @Query('chunkIndex', new ZodValidationPipe(numberString))
    chunkIndex: string,
    @Query('chunkHash', new ZodValidationPipe(fileHashString))
    chunkHash: string,
    @Query('fileHash', new ZodValidationPipe(fileHashString)) fileHash: string
  ) {
    const chunks: Buffer[] = []
    for await (const chunk of req.raw) {
      chunks.push(chunk)
    }

    return this.fileMultipartUploadService.uploadFileChunk({
      chunkData: Buffer.concat(chunks),
      chunkIndex: parseInt(chunkIndex, 10),
      chunkHash,
      fileHash
    })
  }

  // %% mergeFileChunks %%
  @Post('chunk/merge')
  async mergeFileChunks(
    @Body(new ZodValidationPipe(FileUploadController.mergeFileChunksDTO))
    data: z.infer<typeof FileUploadController.mergeFileChunksDTO>
  ) {
    return this.fileMultipartUploadService.mergeFileChunks({
      fileHash: data.fileHash,
      fileName: data.fileName,
      variants: data.variants as FileVariant[] | undefined,
      lifetime: data.lifetime
    })
  }
  private static mergeFileChunksDTO = z.object({
    fileHash: z.string(),
    fileName: z.string(),
    variants: z.array(fileVariant).optional(),
    lifetime: z.number().optional()
  })
}
