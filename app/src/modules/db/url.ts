import type { AppConfig } from '../config/loadConfig'

export const getDBUrl = (config: AppConfig['db']) =>
  `${config.type}://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`
