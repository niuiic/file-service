import { Transform, type Readable } from 'stream'
import sharp from 'sharp'
import { Inject, Injectable } from '@nestjs/common'
import { Providers } from '@/modules/symbol'
import type { AppConfig } from '@/share/config'

interface CreateVariant {
  execute(fileData: Readable): Transform
}

@Injectable()
export class CreatePngCompressed implements CreateVariant {
  constructor(@Inject(Providers.Config) private readonly config: AppConfig) {}

  execute(fileData: Readable) {
    return fileData
      .pipe(sharp().png({ quality: this.config.variant.quality }))
      .pipe(
        new Transform({
          transform(chunk, _, callback) {
            this.push(chunk)
            callback()
          }
        })
      )
  }
}

@Injectable()
export class CreateJpegCompressed implements CreateVariant {
  constructor(@Inject(Providers.Config) private readonly config: AppConfig) {}

  execute(fileData: Readable) {
    return fileData
      .pipe(sharp().jpeg({ quality: this.config.variant.quality }))
      .pipe(
        new Transform({
          transform(chunk, _, callback) {
            this.push(chunk)
            callback()
          }
        })
      )
  }
}
