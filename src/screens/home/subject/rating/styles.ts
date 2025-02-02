/*
 * @Author: czy0729
 * @Date: 2022-07-06 23:30:52
 * @Last Modified by: czy0729
 * @Last Modified time: 2023-01-18 02:51:38
 */
import { _ } from '@stores'

export const memoStyles = _.memoStyles(() => ({
  container: {
    paddingHorizontal: _.wind,
    marginTop: _.lg
  },
  hide: {
    paddingHorizontal: _.wind,
    marginTop: _.lg,
    marginBottom: -_.sm
  },
  hideScore: {
    height: _.r(144)
  }
}))
