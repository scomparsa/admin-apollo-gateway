import Koa from 'koa'
import helmet from 'koa-helmet'
import realIp from 'koa-real-ip'
import session from 'koa-session'
import KoaRouter from 'koa-router'

import { koa as voyagerMiddleware } from 'graphql-voyager/middleware'

import { SERVER_SETTINGS } from './configs/server'

const app = new Koa()
const router = new KoaRouter()

router.all('/graph', voyagerMiddleware({ endpointUrl: '/graphql' }))

app.use(helmet())
app.use(realIp())
app.use(session({ maxAge: <number>SERVER_SETTINGS.sessionMaxAge }, app))
app.use(router.routes())
app.use(router.allowedMethods())

export { app }
