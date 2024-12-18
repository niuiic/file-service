import { Inject, Injectable } from '@nestjs/common'
import { FileDAO } from './dao'

@Injectable()
export class FileService {
  constructor(@Inject(FileDAO) private readonly dao: FileDAO) {}

  async queryFileById(id: string) {
    return this.dao.queryFileById(id)
  }

  async queryFilesById(ids: string[]) {
    return this.dao.queryFilesById(ids)
  }
}
