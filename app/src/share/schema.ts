import z from 'zod'

export const idString = () =>
  z.string().refine((x) => x.match(/^[\d]+$/), 'id is invalid')
