import { Inject, Injectable } from '@nestjs/common'
import { FileDAO } from './dao'

@Injectable()
export class FileService {
  public constructor(@Inject(FileDAO) private readonly dao: FileDAO) {}

  public async queryFileById(id: string) {
    return this.dao.queryFileById(id)
  }

  public async queryFilesById(ids: string[]) {
    return this.dao.queryFilesById(ids)
  }
}
