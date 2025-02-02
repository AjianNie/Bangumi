/*
 * @Author: czy0729
 * @Date: 2021-01-21 17:40:59
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-03 11:03:53
 */
import React from 'react'
import { Text } from '@components'
import { obc } from '@utils/decorators'
import { Ctx } from '../types'

/** 少于这个数字的, 为坟贴 */
const OLD_GROUP_ID = 367000

function Title({ topicId, title, replyCount, isReaded, isGroup }, { $ }: Ctx) {
  // 处理 (+30) +10 样式
  const replyText = `+${replyCount}`
  let replyAdd: {}
  if (isReaded) {
    const readed = $.readed(topicId)
    if (replyCount > readed.replies) replyAdd = `+${replyCount - readed.replies}`
  }

  // 标记坟贴
  let isOldTopic = false
  if (isGroup) {
    const id = parseInt(topicId.substring(6))
    if (id < OLD_GROUP_ID) isOldTopic = true
  }

  return (
    <Text size={15} bold>
      {title}
      {!!replyCount && (
        <Text type={isReaded ? 'sub' : 'main'} size={11} lineHeight={15} bold>
          {' '}
          {replyText}
        </Text>
      )}
      {!!replyAdd && (
        <Text type='main' size={11} lineHeight={15} bold>
          {' '}
          {replyAdd}
        </Text>
      )}
      {isOldTopic && (
        <Text size={11} lineHeight={15} type='warning'>
          {' '}
          旧帖
        </Text>
      )}
    </Text>
  )
}

export default obc(Title)
