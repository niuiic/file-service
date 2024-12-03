import { Controller, Get, Inject } from '@nestjs/common'
import type { FileService } from './file.service'

@Controller('file')
export class FileController {
  public constructor(@Inject() private readonly fileService: FileService) {}

  @Get('hello')
  public getHello() {
    return this.fileService.hello()
  }
}
