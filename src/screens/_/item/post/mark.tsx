/*
 * @Author: czy0729
 * @Date: 2022-09-26 22:17:30
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-26 23:31:17
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, RenderHtml, UserStatus } from '@components'
import { _, systemStore } from '@stores'
import { open, appNavigate, HTMLDecode } from '@utils'
import { obc } from '@utils/decorators'
import { Avatar, Name } from '../../base'

const avatarWidth = 20

function Mark(
  { style = undefined, id, message, userId, userName, avatar, url, event },
  { navigation }
) {
  const styles = memoStyles()
  const { avatarRound } = systemStore.setting
  const imagesMaxWidthSub = _.window.width - _.wind - avatarWidth - _.sm
  return (
    <Flex style={[styles.item, style]}>
      <Flex style={avatarRound ? styles.round : styles.rectangle}>
        <View style={_.mr.sm}>
          <UserStatus userId={userId} mini>
            <Avatar
              navigation={navigation}
              size={avatarWidth}
              userId={userId}
              name={userName}
              src={avatar}
              event={event}
            />
          </UserStatus>
        </View>
        <Name userId={userId} size={10} bold>
          {HTMLDecode(userName)}
        </Name>
      </Flex>
      <RenderHtml
        style={_.ml.sm}
        baseFontStyle={_.baseFontStyle.sm}
        imagesMaxWidth={imagesMaxWidthSub}
        html={message}
        onLinkPress={href => appNavigate(href, navigation, {}, event)}
        onImageFallback={() => open(`${url}#post_${id}`)}
      />
    </Flex>
  )
}

export default obc(Mark)

const memoStyles = _.memoStyles(() => ({
  item: {
    paddingRight: _.sm + 2,
    paddingBottom: _.sm
  },
  round: {
    padding: 4,
    paddingRight: 12,
    backgroundColor: _.colorBg,
    borderRadius: 16
  },
  rectangle: {
    padding: 4,
    paddingRight: 8,
    backgroundColor: _.colorBg,
    borderRadius: _.radiusSm
  }
}))
