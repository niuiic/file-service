import type { AppConfig } from '@/share/config'
import { Inject, Injectable } from '@nestjs/common'
import { Providers } from '../symbol'

@Injectable()
export class Id {
  constructor(@Inject(Providers.Config) config: AppConfig) {
    this.machineId = BigInt(config.machineId)
  }

  private readonly machineIdLeftShift = 16n
  private readonly timestampLeftShift = 22n

  private timestamp = 0n
  private sequence = 0n
  private machineId = 0n

  generateId(): string {
    const timestamp = BigInt(new Date().getTime())
    if (timestamp === this.timestamp) {
      this.sequence += 1n
      if (this.sequence > 2 ** 16) {
        throw new Error('雪花算法序列号溢出')
      }
    } else {
      this.sequence = 0n
    }
    this.timestamp = timestamp

    let id = 0n
    id |= this.machineId << this.machineIdLeftShift
    id |= this.timestamp << this.timestampLeftShift
    id |= this.sequence
    return id.toString()
  }
}
