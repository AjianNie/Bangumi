/*
 * @Author: czy0729
 * @Date: 2019-08-11 20:58:39
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-05-26 12:49:24
 */
import { cheerio } from '@utils/html'

/**
 * 分析今日收看记录
 * @param {*} HTML
 */
export function cheerioToday(HTML: string) {
  return String(cheerio(HTML)('li').text())
    .replace('部。', '部，')
    .replace(/今日番组|。/g, '')
}
