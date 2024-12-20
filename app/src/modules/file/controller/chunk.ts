import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req
} from '@nestjs/common'
import z from 'zod'
import { FileChunkService } from '../service/chunk'
import { ZodValidationPipe } from '@/share/validate'
import type { FastifyRequest } from 'fastify/types/request'
import type { MultipartValue } from '@fastify/multipart'

// % controller %
@Controller('/file/chunk')
export class FileChunkController {
  // %% constructor %%
  constructor(
    @Inject(FileChunkService)
    private readonly fileChunkService: FileChunkService
  ) {}

  // %% requestFileChunks %%
  @Post('request')
  async requestFileChunks(
    @Body(new ZodValidationPipe(FileChunkController.requestFileChunksDTO))
    data: z.infer<typeof FileChunkController.requestFileChunksDTO>
  ) {
    return this.fileChunkService.requestFileChunks(
      data.fileHash,
      data.fileName,
      data.fileSize
    )
  }
  // %% uploadFileChunk %%
  private static requestFileChunksDTO = z.object({
    fileHash: z.string(),
    fileName: z.string(),
    fileSize: z.number()
  })

  @Post('upload')
  async uploadFileChunk(@Req() req: FastifyRequest) {
    const chunk = await req.file()
    if (!chunk) {
      throw new BadRequestException('未收到文件')
    }

    const chunkData = await chunk.toBuffer()
    const chunkHash = (chunk.fields.chunkHash as MultipartValue<string>)?.value
    const chunkIndex = (chunk.fields.chunkIndex as MultipartValue<number>)
      ?.value
    const fileHash = (chunk.fields.fileHash as MultipartValue<string>)?.value

    if (!(typeof fileHash === 'string')) {
      throw new BadRequestException('文件hash值错误')
    }
    if (!(typeof chunkHash === 'string')) {
      throw new BadRequestException('分片hash值错误')
    }

    await this.fileChunkService.uploadFileChunk({
      chunkData,
      chunkIndex,
      chunkHash,
      fileHash
    })
  }

  // %% mergeFileChunks %%
  @Post('merge')
  async mergeFileChunks(
    @Body('fileHash', new ZodValidationPipe(z.string())) fileHash: string
  ) {
    return this.fileChunkService.mergeFileChunks(fileHash)
  }
}
