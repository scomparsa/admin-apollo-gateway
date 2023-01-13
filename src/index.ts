import { Context } from 'koa'
import { init, captureException, captureMessage } from '@sentry/node'
import apm from 'elastic-apm-node'
import { IS_LOCAL, NODE_ENV, SENTRY_DSN, SERVER_SETTINGS } from './configs'
import { app } from './app'
import { serverBootstrap } from './server'

if (!IS_LOCAL) {
  apm.start()
  /**
   * send error message to Sentry
   */
  init({ dsn: SENTRY_DSN, environment: NODE_ENV })

  if (process.listeners('unhandledRejection').length < 1) {
    ;(process as NodeJS.EventEmitter).on('unhandledRejection', (err) => {
      captureException(err)
      process.exit(1)
    })
  }

  if (process.listeners('uncaughtException').length < 1) {
    ;(process as NodeJS.EventEmitter).on('uncaughtException', (err) => {
      captureException(err)
      process.exit(1)
    })
  }

  app.on('error', (err: Error, ctx: Context) => {
    console.error(err, ctx)
    captureException(err)
    if (ctx) captureMessage(JSON.stringify(ctx))
  })
}

async function main() {
  await serverBootstrap(app)

  app.listen(SERVER_SETTINGS.port, () => {
    console.info(`🌍 Admin apollo gateway is running at ${SERVER_SETTINGS.host}:${SERVER_SETTINGS.port}`)
    console.info(`🚀 Admin apollo gateway ready at http://${SERVER_SETTINGS.host}:${SERVER_SETTINGS.port}/graphql`)
  })
}

main()
