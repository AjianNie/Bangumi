/*
 * @Author: czy0729
 * @Date: 2022-12-08 11:03:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-12-20 23:14:28
 */
import React from 'react'
import { obc } from '@utils/decorators'
import { Ctx } from '../types'
import Item from './item'
import { memoStyles } from './styles'

export default obc(({ item }, { $, navigation }: Ctx) => {
  return (
    <Item
      navigation={navigation}
      styles={memoStyles()}
      item={item}
      upload={$.upload(item.subject?.id)}
      onBottom={$.onBottom}
      onSubmit={$.onSubmit}
    />
  )
})
