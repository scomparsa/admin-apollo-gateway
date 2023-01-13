import jwt from 'jsonwebtoken'
import { SERVER_SETTINGS } from '@/configs/server'

const scheme = <string>SERVER_SETTINGS.jwtScheme
const secret = <string>SERVER_SETTINGS.jwtSecret

/**
 * Get a JWT token like `scheme` + ' ' + `token`
 *
 * @param {object} payload (defaults: {})
 * @param {string} expiresIn (defaults: 1d)
 * @return {string}
 */
function getToken(payload: object = {}, expiresIn = '30d'): string {
  return [scheme, jwt.sign(payload, secret, { expiresIn })].join(' ')
}

/**
 * Get JWT payload
 *
 * @param {string } token JWT token like `scheme` + ' ' + `token`
 * @return {object | string}
 */
function getJWTPayload(token: string): object | string {
  const [, tokenWithoutScheme] = token.split(' ')
  return jwt.verify(tokenWithoutScheme, secret)
}

export { getToken, getJWTPayload }
