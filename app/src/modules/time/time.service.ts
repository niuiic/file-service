import { Inject, Injectable } from '@nestjs/common'
import { Providers } from '../symbol'
import type { AppConfig } from '@/share/config'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

@Injectable()
export class TimeService {
  constructor(@Inject(Providers.Config) private readonly config: AppConfig) {}

  getNow() {
    return toZonedTime(new Date(), this.config.timezone)
  }

  formatTime(time: Date) {
    return format(time, 'yyyy/MM/dd HH:mm:ss')
  }
}
