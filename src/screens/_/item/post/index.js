/*
 * @Author: czy0729
 * @Date: 2019-04-30 18:47:13
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-12-24 03:29:59
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Text, Touchable, RenderHtml } from '@components'
import { _, rakuenStore } from '@stores'
import { getTimestamp, open } from '@utils'
import { memo, obc } from '@utils/decorators'
import { appNavigate } from '@utils/app'
import { HTMLDecode } from '@utils/html'
import decoder from '@utils/thirdParty/html-entities-decoder'
import { HOST, EVENT } from '@constants'
import { Avatar, Name } from '../../base'
import UserLabel from './user-label'
import FloorText from './floor-text'
import IconExtra from './icon-extra'
import ItemSub from './sub'
import { isBlockUser } from './utils'

const avatarWidth = 32
const imagesMaxWidth = _.window.width - 2 * _.wind - avatarWidth - _.sm
const expandNum = 4
const defaultProps = {
  navigation: {},
  styles: {},
  contentStyle: {},
  authorId: '',
  avatar: '',
  erase: '',
  floor: '',
  id: 0,
  isAuthor: false,
  isExpand: false,
  isFriend: false,
  isJump: false,
  isNew: false,
  matchLink: false,
  msg: '',
  postId: '', // 存在就跳转到对应楼层
  readedTime: '',
  replySub: '',
  showFixedTextare: false,
  sub: [],
  time: '',
  translate: '',
  url: '',
  userId: '',
  userName: '',
  userSign: '',
  event: EVENT,
  onToggleExpand: Function.prototype
}

const Item = memo(
  ({
    navigation,
    styles,
    contentStyle,
    authorId,
    avatar,
    erase,
    floor,
    id,
    isAuthor,
    isExpand,
    isFriend,
    isJump,
    isNew,
    matchLink,
    msg,
    postId,
    readedTime,
    replySub,
    showFixedTextare,
    sub,
    time,
    translate,
    url,
    userId,
    userName,
    userSign,
    event,
    onToggleExpand
  }) => {
    rerender('Topic.Item.Main')

    // 遗留问题, 给宣传语增加一点高度
    const _msg = msg.replace(
      '<span style="font-size:10px; line-height:10px;">[来自Bangumi for',
      '<span style="font-size:10px; line-height:20px;">[来自Bangumi for'
    )
    return (
      <Flex
        style={[_.container.item, isNew && styles.itemNew, isJump && styles.itemJump]}
        align='start'
      >
        <Avatar
          style={styles.image}
          navigation={navigation}
          userId={userId}
          name={userName}
          size={36}
          src={avatar}
          event={event}
        />
        <Flex.Item style={[styles.content, contentStyle]}>
          <Flex align='start'>
            <Flex.Item>
              <Name
                userId={userId}
                size={userName.length > 10 ? 12 : 14}
                lineHeight={14}
                bold
                right={
                  <UserLabel
                    isAuthor={isAuthor}
                    isFriend={isFriend}
                    userSign={userSign}
                  />
                }
              >
                {HTMLDecode(userName)}
              </Name>
            </Flex.Item>
            <IconExtra
              id={id}
              msg={msg}
              replySub={replySub}
              erase={erase}
              userId={userId}
              userName={userName}
              showFixedTextare={showFixedTextare}
            />
          </Flex>
          <FloorText time={time} floor={floor} />
          <RenderHtml
            style={_.mt.sm}
            baseFontStyle={_.baseFontStyle.md}
            imagesMaxWidth={imagesMaxWidth}
            html={_msg}
            matchLink={matchLink}
            onLinkPress={href => appNavigate(href, navigation, {}, event)}
            onImageFallback={() => open(`${url}#post_${id}`)}
          />
          {!!translate && (
            <Text style={styles.translate} size={11}>
              {translate}
            </Text>
          )}
          <View style={styles.sub}>
            <Flex wrap='wrap'>
              {sub
                .filter((item, index) => (isExpand ? true : index < expandNum))
                .map(item => (
                  <ItemSub
                    key={item.id}
                    id={item.id}
                    message={item.message}
                    userId={item.userId}
                    userName={item.userName}
                    avatar={item.avatar}
                    floor={item.floor}
                    erase={item.erase}
                    replySub={item.replySub}
                    time={item.time}
                    postId={postId}
                    authorId={authorId}
                    uid={userId}
                    url={url}
                    readedTime={readedTime}
                    matchLink={matchLink}
                    showFixedTextare={showFixedTextare}
                    event={event}
                  />
                ))}
            </Flex>
            {sub.length > expandNum && (
              <Touchable onPress={() => onToggleExpand(id)}>
                <Text
                  style={styles.expand}
                  type={isExpand ? 'sub' : 'main'}
                  size={12}
                  align='center'
                  bold
                >
                  {isExpand ? '收起楼层' : `展开 ${sub.length - expandNum} 条回复`}
                </Text>
              </Touchable>
            )}
          </View>
        </Flex.Item>
      </Flex>
    )
  },
  defaultProps,
  ({ sub, ...other }) => ({
    sub: sub.length,
    ...other
  })
)

export const ItemPost = obc(
  (
    {
      contentStyle,
      avatar,
      userId,
      userName,
      replySub,
      message,
      sub,
      id,
      authorId,
      postId,
      time,
      floor,
      userSign,
      erase,
      rendered,
      matchLink,
      showFixedTextare,
      event
    },
    { $, navigation }
  ) => {
    rerender('Topic.Item')

    // 屏蔽脏数据
    if (!userId) return null

    // [test code]
    // const _floor = Number(floor.replace('#', ''))
    // if (_floor !== 13) return null

    // 屏蔽用户
    if (isBlockUser(userId, userName, replySub)) return null

    // 屏蔽内容删除
    const { filterDelete, blockKeywords } = rakuenStore.setting
    let msg = decoder(message)
    if (filterDelete) {
      msg = decoder(message)
      if (msg.includes('内容已被用户删除')) return null
    }

    // 展开子楼层
    // @todo 状态分离optimize
    const { expands, translateResultFloor } = $.state
    let isExpand
    if (expands !== undefined) {
      isExpand =
        sub.length <= expandNum || (sub.length > expandNum && expands.includes(id))
    } else {
      isExpand = true
    }

    // 新楼层标识
    const readedTime = $.readed?._time
    const isNew = !!readedTime && getTimestamp(time) > readedTime

    // 作者
    const isAuthor = authorId === userId

    // 跳转楼层标识
    const isJump = !!postId && postId === id

    // 浏览器查看
    const { _url } = $.params || {}
    const url = _url || `${HOST}/rakuen/topic/${$.topicId}`

    // 屏蔽关键字命中
    if (blockKeywords.some(item => msg.includes(item))) {
      msg =
        '<span style="color:#999;font-size:12px">命中自定义关键字，已被App屏蔽</span>'
    }

    return (
      <Item
        navigation={navigation}
        styles={memoStyles()}
        contentStyle={contentStyle}
        authorId={authorId}
        avatar={avatar}
        erase={erase}
        floor={floor}
        id={id}
        isAuthor={isAuthor}
        isExpand={isExpand}
        isFriend={$.myFriendsMap?.[userId]}
        isJump={isJump}
        isNew={isNew}
        matchLink={matchLink === undefined ? rendered : matchLink}
        msg={msg}
        postId={postId}
        readedTime={readedTime}
        replySub={replySub}
        showFixedTextare={showFixedTextare}
        sub={sub}
        time={time}
        translate={translateResultFloor?.[id]}
        url={url}
        userId={userId}
        userName={userName}
        userSign={userSign}
        event={event}
        onToggleExpand={$.toggleExpand}
      />
    )
  }
)

const memoStyles = _.memoStyles(() => ({
  itemNew: {
    backgroundColor: _.colorMainLight
  },
  itemJump: {
    borderBottomWidth: 2,
    borderColor: _.colorSuccess
  },
  image: {
    marginTop: _.space,
    marginLeft: _.wind
  },
  content: {
    paddingVertical: _.space,
    paddingRight: _.wind,
    marginLeft: _.sm
  },
  sub: {
    marginTop: _.md,
    marginBottom: -20
  },
  expand: {
    paddingTop: _.sm,
    paddingBottom: _.md,
    marginLeft: 44
  },
  translate: {
    padding: _.sm,
    marginTop: _.sm,
    marginRight: _.sm,
    backgroundColor: _.select(_.colorBg, _._colorDarkModeLevel1),
    borderRadius: _.radiusXs,
    overflow: 'hidden'
  }
}))
