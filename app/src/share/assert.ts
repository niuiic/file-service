import { isNil } from './isNil'

export function assert(value: unknown, error?: string | Error): asserts value {
  if (!value) {
    if (error instanceof Error) {
      throw error
    }
    if (isNil(error)) {
      throw new Error('value is not truthy')
    }
    throw new Error(error)
  }
}
