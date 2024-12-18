import { BadRequestException, type PipeTransform } from '@nestjs/common'
import type { ZodError, ZodType } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType | (() => ZodType)) {}

  transform(value: unknown) {
    try {
      if (typeof this.schema === 'function') {
        return this.schema().parse(value)
      } else {
        return this.schema.parse(value)
      }
    } catch (e) {
      throw new BadRequestException('参数格式错误', {
        description: JSON.parse((e as ZodError).message)[0].message
      })
    }
  }
}
