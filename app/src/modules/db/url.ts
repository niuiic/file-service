import type { AppConfig } from '@/share/config'

export const getDBUrl = (config: AppConfig['db']) =>
  `${config.type}://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`
