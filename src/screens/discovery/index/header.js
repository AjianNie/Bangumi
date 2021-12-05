/*
 * @Author: czy0729
 * @Date: 2019-08-10 17:53:18
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-12-05 11:22:35
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Text, Heatmap } from '@components'
import { StatusBarPlaceholder } from '@screens/_'
import { _ } from '@stores'
import { obc } from '@utils/decorators'
import Award from './award'
import Today from './today'
import SortMenu from './sort-menu'

function Header(props, { $ }) {
  rerender('Discovery.Header')

  const styles = memoStyles()
  const { dragging } = $.state
  const { today } = $.home
  return (
    <View style={styles.container}>
      <StatusBarPlaceholder />
      {!dragging && (
        <View>
          <Award />
          <Heatmap
            id='发现.跳转'
            data={{
              to: 'Award'
            }}
          />
        </View>
      )}
      <SortMenu />
      {!dragging && (
        <>
          <Flex style={styles.wrap}>
            {!!$.online && (
              <Text align='right' size={12}>
                online {$.online}
              </Text>
            )}
            <Flex.Item>
              <Text align='right' size={12} numberOfLines={1}>
                {$.today || today}
              </Text>
            </Flex.Item>
          </Flex>
          <Today />
        </>
      )}
    </View>
  )
}

export default obc(Header)

const memoStyles = _.memoStyles(() => ({
  container: {
    paddingBottom: _.sm
  },
  wrap: {
    paddingHorizontal: _.windSm + 2,
    marginTop: _.md + 8,
    marginBottom: _.xs
  }
}))
