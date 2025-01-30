import { Global, Module } from '@nestjs/common'
import { Providers } from '../symbol'
import { createLogger, transports, format } from 'winston'
import { TimeService } from '../time/time.service'

export type Logger = ReturnType<typeof createLogger>

@Global()
@Module({
  providers: [
    {
      provide: Providers.Logger,
      useFactory(timeService: TimeService) {
        const formatter = format.printf(
          (info) =>
            `[${info.level}](${timeService.formatTime(timeService.getNow())}) ${JSON.stringify(info.message)}`
        )

        const logger = createLogger({
          format: formatter,
          transports: [
            new transports.File({
              filename: 'all.log',
              level: 'info'
            })
          ]
        })

        if (process.env.NODE_ENV !== 'production') {
          logger.add(
            new transports.Console({
              format: format.combine(format.colorize(), formatter)
            })
          )
        }

        return logger
      },
      inject: [TimeService]
    }
  ],
  exports: [Providers.Logger]
})
export class LoggerModule {}
