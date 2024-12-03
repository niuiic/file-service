import { Inject, Injectable } from '@nestjs/common'
import type { FileDAO } from './file.dao'

@Injectable()
export class FileService {
  public constructor(@Inject() private readonly dao: FileDAO) {}

  public async hello() {
    const res = await this.dao.queryFileById('1')
    return res.name
  }
}
