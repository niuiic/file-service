import { Inject } from '@nestjs/common'
import { FileChunkService } from '../service/chunk'

// % controller %
export class FileChunkController {
  constructor(
    @Inject(FileChunkService)
    private readonly fileChunkService: FileChunkService
  ) {}
}
