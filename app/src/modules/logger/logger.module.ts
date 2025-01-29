import { Global, Module } from '@nestjs/common'
import { Providers } from '../symbol'
import { createLogger, transports, format } from 'winston'

export type Logger = ReturnType<typeof createLogger>

@Global()
@Module({
  providers: [
    {
      provide: Providers.Logger,
      useFactory() {
        const logger = createLogger({
          format: format.combine(format.timestamp(), format.json()),
          transports: [
            new transports.File({
              filename: 'all.log',
              level: 'info'
            }),
            new transports.File({
              filename: 'recover.log',
              level: 'warn',
              handleExceptions: false
            })
          ]
        })

        if (process.env.NODE_ENV !== 'production') {
          logger.add(
            new transports.Console({
              format: format.combine(format.colorize(), format.simple())
            })
          )
        }

        return logger
      }
    }
  ],
  exports: [Providers.Logger]
})
export class LoggerModule {}
