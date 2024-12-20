import { Body, Controller, Inject, Post } from '@nestjs/common'
import z from 'zod'
import { FileChunkService } from '../service/chunk'
import { ZodValidationPipe } from '@/share/validate'

// % controller %
@Controller('/file/chunk')
export class FileChunkController {
  constructor(
    @Inject(FileChunkService)
    private readonly fileChunkService: FileChunkService
  ) {}

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
  private static requestFileChunksDTO = z.object({
    fileHash: z.string(),
    fileName: z.string(),
    fileSize: z.number()
  })
}
