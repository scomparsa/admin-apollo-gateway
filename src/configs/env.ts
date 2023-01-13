import serviceList from './service-list.json'

export const NODE_ENV = <string>process.env.NODE_ENV

export const LOCAL_ENV = 'local'
export const DEV_ENV = 'development'
export const PRO_ENV = 'production'

export const IS_LOCAL: boolean = NODE_ENV === LOCAL_ENV
export const IS_DEV: boolean = NODE_ENV === DEV_ENV
export const IS_PRO: boolean = NODE_ENV === PRO_ENV

const serviceProjectNames = IS_LOCAL && (<string>process.env.SERVICE_PROJECT_NAMES).split(',')
export const SERVICE_LIST = serviceList.map((service) => ({
  ...service,
  isLocal:
    !serviceProjectNames || (serviceProjectNames && (<string[]>serviceProjectNames).includes(service.projectName)),
}))
