// Type definitions for koa-real-ip
// Project: https://github.com/diorahman/koa-real-ip
// Definitions by: LQ <scomparsa.6k@gmail.com>
// TypeScript Version: 3.1.x

import { Middleware, ParameterizedContext } from 'koa'

declare module 'koa-real-ip' {
  export default function realIp(): Middleware<ParameterizedContext<any, {}>>
}
