/*
 * 使用 RN.fetch 的请求
 *  - 待废弃, 尽量少用
 *
 * @Author: czy0729
 * @Date: 2022-08-06 12:36:46
 * @Last Modified by: czy0729
 * @Last Modified time: 2023-01-11 10:06:13
 */
import { APP_ID, UA } from '@constants/constants'
import { AnyObject } from '@types'
import fetch from '../thirdParty/fetch-polyfill'
import { urlStringify, sleep, getTimestamp } from '../utils'
import {
  // info as UIInfo,
  loading
} from '../ui'
import { getUserStoreAsync } from '../async'
import { log } from '../dev'
import { safe } from './utils'
import { SHOW_LOG, FETCH_TIMEOUT, FETCH_RETRY, HEADERS_DEFAULT } from './ds'
import { FetchAPIArgs, FetchHTMLArgs } from './types'

const RETRY_CACHE = {}

/** 统一请求方法 (若GET请求异常, 默认一段时间后重试retryCb, 直到成功) */
export async function fetchAPI(args: FetchAPIArgs) {
  const {
    method = 'GET',
    url,
    data = {},
    retryCb,
    info = '',
    noConsole = false
  } = args || {}
  const isGet = method === 'GET'
  const userStore = getUserStoreAsync()
  const config: AnyObject = {
    timeout: FETCH_TIMEOUT,
    headers: {
      Authorization: `${userStore.accessToken.token_type} ${userStore.accessToken.access_token}`,
      'User-Agent': UA
    }
  }
  const body: AnyObject = {
    app_id: APP_ID,
    ...data
  }

  let _url = url
  let hide: () => void
  if (isGet) {
    config.method = 'GET'
    body.state = getTimestamp() // 随机数防止接口CDN缓存
    _url += `${_url.includes('?') ? '&' : '?'}${urlStringify(body)}`
  } else {
    config.method = 'POST'
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    config.body = urlStringify(body)
    if (!noConsole) hide = loading()
  }

  if (SHOW_LOG) log(`🌐 ${info} ${_url}`)

  return fetch(_url, config)
    .then(response => {
      if (hide) hide()

      // @ts-expect-error
      return response.json()
    })
    .then(json => {
      // 成功后清除失败计数
      if (isGet) {
        const key = `${url}|${urlStringify(data)}`
        if (RETRY_CACHE[key]) RETRY_CACHE[key] = 0
      }

      // @issue 由于 Bangumi 提供的 API 没有统一返回数据
      // 正常情况没有 code, 错误情况例如空的时候, 返回 { code: 400, err: '...' }
      if (json && json.error) {
        if (json.error === 'invalid_token') userStore.setOutdate()
        return Promise.resolve({
          code: json.code,
          error: json.error,
          request: json.request
        })
      }

      // 接口某些字段为空返回null, 影响到解构的正常使用, 统一处理成空字符串
      return Promise.resolve(safe(json))
    })
    .catch(async err => {
      if (hide) hide()

      // @issue Bangumi 提供的 API 频繁请求非常容易报错, 也就只能一直请求到成功为止了
      if (isGet && typeof retryCb === 'function') {
        await sleep()

        const key = `${url}|${urlStringify(data)}`
        RETRY_CACHE[key] = (RETRY_CACHE[key] || 0) + 1
        if (RETRY_CACHE[key] < FETCH_RETRY) return retryCb()
      }

      // UIInfo(`${info}请求失败`)
      return Promise.reject(err)
    })
}

const LAST_FETCH_HTML = {}

/**
 * 请求获取HTML
 *  - chii_cookietime=2592000
 *  - 2021/01/17 拦截瞬间多次完全同样的请求
 */
export async function fetchHTML(args: FetchHTMLArgs): Promise<any> {
  const {
    method = 'GET',
    url,
    data = {},
    headers = {},
    cookie,
    raw = false
  } = args || {}
  const isGet = method === 'GET'

  // 拦截瞬间多次完全同样的请求
  if (isGet) {
    const cacheKey = JSON.stringify({
      url,
      data,
      headers,
      cookie
    })
    const ts = new Date().valueOf()
    if (!LAST_FETCH_HTML[cacheKey]) {
      LAST_FETCH_HTML[cacheKey] = ts
    } else {
      const distance = ts - LAST_FETCH_HTML[cacheKey]
      if (distance <= 2000) {
        log(`[prevent] ⚡️ ${url} ${distance}ms`)
        return Promise.reject(new Error('prevent fetchHTML'))
      }

      LAST_FETCH_HTML[cacheKey] = ts
    }
  }

  const userStore = getUserStoreAsync()
  const { cookie: userCookie, setCookie, userAgent } = userStore.userCookie
  const _config: {
    method?: FetchHTMLArgs['method']
    timeout: typeof FETCH_TIMEOUT
    headers: {
      [key: string]: any
    }
    body?: string
  } = {
    timeout: FETCH_TIMEOUT,
    headers: {}
  }
  const body = {
    ...data
  }

  let _url = url.replace('!', '') // 叹号代表不携带 cookie
  if (url.indexOf('!') !== 0) {
    _config.headers = {
      'User-Agent': userAgent,

      // @issue iOS 不知道为什么会有文本乱插在cookie前面, 要加分号防止
      Cookie: cookie
        ? `${userCookie} ${cookie} ${setCookie}`
        : `; ${userCookie}; ${setCookie}`,
      ...headers
    }

    // @notice 遗留问题, 要把 chii_cookietime=0 换成 chii_cookietime=2592000, 而且必带 chii_cookietime
    if (_config.headers.Cookie.includes('chii_cookietime=0')) {
      _config.headers.Cookie = _config.headers.Cookie.replace(
        'chii_cookietime=0',
        'chii_cookietime=2592000'
      )
    } else if (!_config.headers.Cookie.includes('chii_cookietime=2592000')) {
      _config.headers.Cookie = `${_config.headers.Cookie}; chii_cookietime=2592000;`
    }
  }

  let hide: () => void
  if (isGet) {
    _config.method = 'GET'
    _config.headers = {
      ...HEADERS_DEFAULT,
      ..._config.headers
    }
    if (Object.keys(body).length) {
      _url += `${_url.includes('?') ? '&' : '?'}${urlStringify(body)}`
    }
  } else {
    _config.method = 'POST'
    _config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    _config.body = urlStringify(body)
    hide = loading('Loading...', 8)
  }

  if (SHOW_LOG) log(`⚡️ ${_url}`)

  return fetch(_url, _config)
    .then(res => {
      if (!isGet) log(method, 'success', _url, _config, res)
      if (hide) hide()

      // @ts-expect-error
      return Promise.resolve(raw ? res : res.text())
    })
    .catch(error => {
      console.error('[utils/fetch] fetchHTML', url, error)
      if (hide) hide()
      return Promise.reject(error)
    })
}
