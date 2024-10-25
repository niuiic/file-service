import { DB } from '@/share/db/db'
import { files } from '@/share/db/schema'
import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

@Injectable()
export class FileDao {
  public constructor(@Inject('DB') private readonly db: DB) {}

  public queryFileById(id: string) {
    this.db.insert(files).values({
      id: BigInt(1),
      name: 'name',
      hash: 'hash',
      size: 1,
      createTime: new Date(),
      uploadTime: new Date(),
      deleted: false
    })

    return this.db.query.files.findFirst({
      where: (users) => eq(users.id, BigInt(id))
    })
  }
}
