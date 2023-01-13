import { IAuth, auth } from './auth'

export interface IAdminService {
  auth: IAuth
}

export const adminService: IAdminService = {
  auth,
}
