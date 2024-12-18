import { Controller, Post, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

@Controller('file/upload')
export class FileUploadController {
  @Post('blob')
  async uploadFileByBlob(@Req() req: FastifyRequest) {
    await req.file()
  }
}
