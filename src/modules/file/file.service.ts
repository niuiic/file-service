import { Inject, Injectable } from '@nestjs/common'
import { FileDao } from './file.dao'

@Injectable()
export class FileService {
  public constructor(@Inject() private readonly dao: FileDao) {}

  public async hello() {
    const res = await this.dao.queryFileById('1')
    return res?.name ?? 'not found'
  }
}
