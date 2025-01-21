import { Transform, type Readable } from 'stream'
import sharp from 'sharp'
import { Injectable } from '@nestjs/common'

interface CreateVariant {
  execute(fileData: Readable): Transform
}

@Injectable()
export class CreatePngCompressed implements CreateVariant {
  execute(fileData: Readable) {
    return fileData.pipe(sharp().png({ quality: 80 })).pipe(
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
  execute(fileData: Readable) {
    return fileData.pipe(sharp().jpeg({ quality: 80 })).pipe(
      new Transform({
        transform(chunk, _, callback) {
          this.push(chunk)
          callback()
        }
      })
    )
  }
}
