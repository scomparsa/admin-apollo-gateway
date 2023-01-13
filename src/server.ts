import Koa from 'koa'
import { GraphQLRequest, GraphQLResponse, GraphQLRequestContextWillSendResponse } from 'apollo-server-types'
import { ApolloServer, AuthenticationError, gql } from 'apollo-server-koa'
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import { SERVER_LIST } from './configs'
import { getJWTPayload } from './utils/jwt'
import * as services from './services'

interface ICtx {
  request: Koa.Request
  adminId: number
  serverIds: string[]
  realIp?: string
}

const WITHOUT_AUTH_QUERY_NAMES = [
  'bindLogin',
  'createAdminUserWithFeishu',
  'loginViaFeishu',
  'updateOverseaPrivateMessageStatus',
  'updatePrivateMessageStatus',
]

const isNeedToBeVerified = (request: any, whiteList: string[]) => {
  /**
   * 前端加上batchLink后，query会以数组形式发送
   * 默认只有一条或非batch模式的走白名单鉴定
   * batch多条 默认按照需要解JWT执行
   */
  const isArray = Array.isArray(request.body)
  if (isArray && request.body.length > 1) return true

  const query = isArray ? request.body[0].query : request.body.query

  const [definition] = gql`
    ${query}
  `.definitions as any

  const { selections } = definition.selectionSet
  const [selection] = selections
  const queryName: string = selection.name.value
  const isContainInWhiteList: boolean = whiteList.includes(queryName)

  // GQL 内省查询
  const isIntrospectionQuery = definition.name && definition.name.value === 'IntrospectionQuery'
  return !isIntrospectionQuery && !isContainInWhiteList
}

class ApolloGatewayDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({ request, context }: { request: GraphQLRequest; context: ICtx }) {
    if (request.http) {
      request.http.headers.set('admin-id', String(context.adminId))
      request.http.headers.set('real-ip', context.realIp || '')
    }
  }

  async didReceiveResponse({ response, context }: { response: GraphQLResponse; context: any }) {
    if (response.http) {
      const serverId = response.http.headers.get('Server-Id')

      if (Array.isArray(context.serverIds) && serverId) {
        context.serverIds.push(serverId)
      }
    }

    return response
  }
}

console.log('启动下列服务: ')
console.log(
  SERVER_LIST.reduce((acc, { name, url }: { name: string; url: string }) => {
    acc += `service(${name}) from ${url} \n`
    return acc
  }, ''),
)

const gateway = new ApolloGateway({
  serviceList: SERVER_LIST,
  buildService({ url }) {
    return new ApolloGatewayDataSource({ url })
  },
})

export async function serverBootstrap(app: any) {
  const server = new ApolloServer({
    gateway,
    // !Disable subscriptions (not currently supported with ApolloGateway)
    subscriptions: false,
    context: async ({ ctx }: { ctx: Koa.Context }): Promise<{}> => {
      const { request } = ctx
      const context: ICtx = { request, adminId: 0, serverIds: [], realIp: ctx.get('x-real-ip') }

      if (isNeedToBeVerified(request, WITHOUT_AUTH_QUERY_NAMES)) {
        const { authorization } = request.headers

        if (!authorization) throw new AuthenticationError('You must be logged in')

        // 解析用户信息
        let payload: object | string
        try {
          payload = getJWTPayload(authorization)
        } catch (err) {
          throw new AuthenticationError('You must be logged in')
        }

        const { id } = payload as { id: number }

        // id 为0是后台机器人账号
        if (id !== 0) {
          const auth = await services.adminService.auth.getAuthPayload(id)

          if (!auth) {
            throw new AuthenticationError('You must be logged in')
          }

          // 验证账号是否被冻结
          if (!auth.isActive) {
            throw new AuthenticationError('Your account was not active')
          }
        }

        // 验证最近两次访问ip一致(仅用于生产环境)
        // if (IS_PRO && request.ip !== ip) {
        //   throw new AuthenticationError('You must be logged in')
        // }

        // jwt验证通过，确认用户id
        context.adminId = id
      }

      return context
    },
    plugins: [
      {
        requestDidStart() {
          return {
            willSendResponse({ context, response }: GraphQLRequestContextWillSendResponse<Partial<Koa.Context>>) {
              if (response.http) {
                response.http.headers.set('Server-Id', context.serverIds.join(','))
              }
            },
          }
        },
      },
    ],
  })

  server.applyMiddleware({ app })
}
