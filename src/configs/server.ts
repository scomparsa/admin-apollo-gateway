import { ServiceEndpointDefinition } from '@apollo/gateway'
import { NODE_ENV, LOCAL_ENV, DEV_ENV, PRO_ENV, SERVICE_LIST } from './env'

export const HOST_MAPPING: Record<string, string> = {
  [LOCAL_ENV]: '127.0.0.1',
  [DEV_ENV]: '',
  [PRO_ENV]: '',
}

export const SERVER_SETTINGS: Record<string, string | number | undefined> = {
  host: HOST_MAPPING[NODE_ENV],
  port: 7001,
  sessionMaxAge: 86400000,
  jwtScheme: '',
  jwtSecret: '',
}

export const SERVER_LIST: ServiceEndpointDefinition[] = SERVICE_LIST.map(({ name, port, isLocal }) => ({
  name,
  url: `http://${isLocal ? 'localhost' : HOST_MAPPING[DEV_ENV]}:${port}/graphql`,
}))
