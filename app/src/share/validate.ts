import { BadRequestException, type PipeTransform } from '@nestjs/common'
import type { ZodError, ZodType } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (e) {
      throw new BadRequestException('参数格式错误', {
        description: JSON.parse((e as ZodError).message)[0].message
      })
    }
  }
}
