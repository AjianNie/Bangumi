/*
 * @Author: czy0729
 * @Date: 2022-11-22 20:40:54
 * @Last Modified by: czy0729
 * @Last Modified time: 2023-01-17 07:12:08
 */
import React from 'react'
import { Flex, Iconfont } from '@components'
import { Popover } from '@_'
import { _ } from '@stores'
import { obc } from '@utils/decorators'
import { Ctx } from '../types'

function IconActions({ style = undefined }, { $, navigation }: Ctx) {
  const data = [...$.actions.map(item => item.name), '自定义跳转管理'] as const
  return (
    <Popover
      style={style ? [styles.touch, style] : styles.touch}
      data={data}
      onSelect={title => $.onActionsPress(title, navigation)}
    >
      <Flex style={styles.btn} justify='center'>
        <Iconfont name='md-read-more' color={_.colorIcon} size={25} />
      </Flex>
    </Popover>
  )
}

export default obc(IconActions)

const styles = _.create({
  touch: {
    borderRadius: 20,
    overflow: 'hidden'
  },
  btn: {
    width: 38,
    height: 38
  }
})
