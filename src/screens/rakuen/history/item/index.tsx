/*
 * @Author: czy0729
 * @Date: 2019-11-28 17:16:15
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-11-28 07:20:51
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Text, Touchable, UserStatus, Iconfont } from '@components'
import { Avatar } from '@_'
import { _ } from '@stores'
import { obc } from '@utils/decorators'
import { t } from '@utils/fetch'
import { Ctx } from '../types'
import { memoStyles } from './styles'

function Item(
  { index, topicId, avatar, userName, title, group, time = '', userId },
  { $, navigation }: Ctx
) {
  const styles = memoStyles()
  const desc = [time.split(' ')?.[1], userName, group]
    .filter(item => !!item)
    .join(' / ')
  return (
    <Flex style={styles.container} align='start'>
      <View style={styles.image}>
        <UserStatus userId={userId}>
          <Avatar
            navigation={navigation}
            src={avatar}
            userId={userId}
            name={userName}
          />
        </UserStatus>
      </View>
      <Flex.Item style={index !== 0 && !_.flat && styles.border}>
        <Touchable
          style={styles.item}
          onPress={() => {
            t('本地帖子.跳转', {
              to: 'Topic',
              topicId
            })

            navigation.push('Topic', {
              topicId,
              _noFetch: true,
              _title: title,
              _group: group,
              _time: time,
              _avatar: avatar,
              _userName: userName,
              _userId: userId
            })
          }}
        >
          <Flex align='start'>
            <Flex.Item>
              <Text bold>{title === 'undefined' ? '(此帖子已删除)' : title}</Text>
              <Text style={_.mt.sm} type='sub' size={11}>
                {desc}
              </Text>
            </Flex.Item>
            {$.isFavor(topicId) && (
              <Iconfont
                style={styles.favor}
                size={16}
                name='md-star'
                color={_.colorYellow}
              />
            )}
          </Flex>
        </Touchable>
      </Flex.Item>
    </Flex>
  )
}

export default obc(Item)
