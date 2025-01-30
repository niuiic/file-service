import { Injectable } from '@nestjs/common'
import { CronJob } from 'cron'

@Injectable()
export class TaskService {
  constructor() {}

  registerTask(task: () => unknown, cronTime: string, timezone: string) {
    CronJob.from({
      cronTime,
      onTick: () => {
        task()
      },
      start: true,
      timeZone: timezone
    })
  }
}
