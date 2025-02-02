/*
 * @Author: czy0729
 * @Date: 2019-11-17 14:24:04
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-11-11 06:47:25
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Text, Touchable, Iconfont } from '@components'
import { _ } from '@stores'
import { formatNumber } from '@utils'
import { obc } from '@utils/decorators'
import { Ctx } from '../types'
import { memoStyles } from './styles'

function AuctionList({ style }, { $ }: Ctx) {
  const styles = memoStyles()
  const { showLogs } = $.state
  const { list, _loaded } = $.auctionList
  let successCount = 0
  let successAmount = 0
  list
    .filter(item => item.state === 1)
    .forEach(item => {
      successCount += 1
      successAmount += item.amount
    })
  return (
    <View style={[styles.container, style]}>
      {_loaded && (
        <View style={styles.info}>
          {list.length ? (
            <Text type='tinygrailPlain' size={13}>
              上周公示：共 {list.length || '-'} 人拍卖，成功 {successCount || '-'} 人 /{' '}
              {successAmount ? formatNumber(successAmount, 0) : '-'} 股
            </Text>
          ) : (
            <Flex style={_.mt.md} direction='column'>
              <Text style={_.mt.sm} type='tinygrailPlain' size={13}>
                上周没有拍卖纪录
              </Text>
            </Flex>
          )}
        </View>
      )}
      {!!list.length &&
        showLogs &&
        list
          .sort((a, b) => b.price - a.price)
          .map(item => {
            const isSuccess = item.state === 1
            return (
              <Flex
                key={`${item.time}|${item.price}|${item.amount}`}
                style={styles.item}
              >
                <Text style={styles.time} type='tinygrailText' size={12}>
                  {item.time}
                </Text>
                <Flex.Item style={_.ml.sm}>
                  <Text
                    type='tinygrailPlain'
                    size={12}
                    // onPress={() => {
                    //   t('资产重组.跳转', {
                    //     to: 'Zone',
                    //     from: '竞拍列表',
                    //     monoId: $.monoId,
                    //     userId: item.name
                    //   })

                    //   navigation.push('Zone', {
                    //     userId: item.name,
                    //     from: 'tinygrail'
                    //   })
                    // }}
                  >
                    {item.nickname}
                  </Text>
                </Flex.Item>
                <Flex.Item style={_.ml.sm}>
                  <Text type='tinygrailText' size={12}>
                    ₵{item.price} / {formatNumber(item.amount, 0)}
                  </Text>
                </Flex.Item>
                <Text style={_.ml.sm} type={isSuccess ? 'bid' : 'ask'} size={12}>
                  {isSuccess ? '成功' : '失败'}
                </Text>
              </Flex>
            )
          })}
      {!!list.length && (
        <Touchable onPress={$.toggleLogs}>
          <Flex style={styles.notice} justify='center'>
            <Iconfont
              name={showLogs ? 'md-keyboard-arrow-up' : 'md-keyboard-arrow-down'}
              color={_.colorTinygrailText}
            />
          </Flex>
        </Touchable>
      )}
    </View>
  )
}

export default obc(AuctionList)
