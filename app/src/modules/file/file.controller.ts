import { Controller, Get, Inject } from '@nestjs/common'
import { FileService } from './file.service'

@Controller('file')
export class FileController {
  public constructor(
    @Inject(FileService) private readonly fileService: FileService
  ) {}

  @Get('hello')
  public getHello() {
    return this.fileService.hello()
  }
}
