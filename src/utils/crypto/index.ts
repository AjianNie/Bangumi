/*
 * 加密
 *
 * @Author: czy0729
 * @Date: 2022-05-10 04:54:33
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-08-06 13:05:24
 */
import CryptoJS from 'crypto-js'
import { APP_ID } from '@constants/constants'

/** 加密字符串 */
export function set(data: object | string) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), APP_ID).toString()
}

/** 解密字符串 */
export function get<T extends object | string>(content: string): T {
  const bytes = CryptoJS.AES.decrypt(content.toString(), APP_ID)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

export default {
  set,
  get
}
