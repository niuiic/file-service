import { Inject, Injectable } from '@nestjs/common'
import { FileDeleteService } from './fileDelete.service'
import { FilesDAO } from './files.dao'
import { CronJob } from 'cron'
import { Providers } from '@/modules/symbol'
import type { AppConfig } from '@/share/config'

@Injectable()
export class FileCleanService {
  constructor(
    @Inject(FileDeleteService)
    private readonly fileDeleteService: FileDeleteService,
    @Inject(FilesDAO)
    private readonly filesDAO: FilesDAO,
    @Inject(Providers.Config)
    readonly config: AppConfig
  ) {
    CronJob.from({
      cronTime: config.cleanCron,
      onTick: () => this.cleanExpiredFiles(),
      start: true
    })
  }

  async cleanExpiredFiles() {
    const expiredFiles = await this.filesDAO.queryExpiredFiles()

    await Promise.allSettled(
      expiredFiles.map((x) => this.fileDeleteService.deleteFile(x.id))
    )
  }
}
