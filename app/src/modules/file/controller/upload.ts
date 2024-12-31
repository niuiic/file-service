import z from 'zod'
import { Body, Controller, Inject, Post, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { toFileInfo, type FileInfo } from './fileInfo'
import { ZodValidationPipe } from '@/share/validate'
import { FileUploadService } from '../service/upload'

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
  async uploadFileByStream(@Req() req: FastifyRequest): Promise<FileInfo> {
    const { promise, resolve, reject } = Promise.withResolvers<any>()

    req.raw.on('data', (chunk) => {
      const str = chunk.toString()
    })
    req.raw.on('end', () => {
      resolve('hello')
    })
    req.raw.on('error', (err) => {
      console.log(err)
    })

    return promise
    // return this.fileUploadService
    //   .uploadFileByStream(new Readable(), fileHash, fileName)
    //   .then(toFileInfo)
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
