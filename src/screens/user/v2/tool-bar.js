/*
 * @Author: czy0729
 * @Date: 2019-05-26 02:46:44
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-12-23 20:10:52
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Flex, Iconfont, Text, Touchable, Heatmap } from '@components'
import { Popover } from '@screens/_'
import { _ } from '@stores'
import { observer } from '@utils/decorators'
import {
  MODEL_COLLECTION_STATUS,
  MODEL_COLLECTIONS_ORDERBY
} from '@constants/model'
import { tabs } from './store'

function ToolBar(props, { $ }) {
  const styles = memoStyles()
  const { subjectType, list, order, tag, page } = $.state
  const type = MODEL_COLLECTION_STATUS.getValue(tabs[page].title)
  const userCollectionsTags = $.userCollectionsTags(subjectType, type)
  const filterData = ['重置']
  userCollectionsTags.forEach(item =>
    filterData.push(`${item.tag} (${item.count})`)
  )
  return (
    <Flex style={list && styles.bg}>
      <Flex.Item>
        <Popover
          data={MODEL_COLLECTIONS_ORDERBY.data.map(item => item.label)}
          onSelect={$.onOrderSelect}
        >
          <Flex style={styles.item} justify='center'>
            <Iconfont
              name='sort'
              size={14}
              color={order ? _.colorMain : undefined}
            />
            <Text
              style={_.ml.sm}
              size={12}
              type={order ? 'main' : 'sub'}
              numberOfLines={1}
            >
              {order ? MODEL_COLLECTIONS_ORDERBY.getLabel(order) : '收藏时间'}
            </Text>
          </Flex>
          <Heatmap id='我的.筛选选择' />
        </Popover>
      </Flex.Item>
      <Flex.Item>
        <Popover data={filterData} onSelect={$.onFilterSelect}>
          <Flex style={styles.item} justify='center'>
            <Iconfont
              name='filter'
              size={14}
              color={tag ? _.colorMain : undefined}
            />
            <Text
              style={_.ml.sm}
              size={12}
              type={tag ? 'main' : 'sub'}
              numberOfLines={1}
            >
              {tag ? tag.replace(/ \(\d+\)/, '') : '标签'}
            </Text>
          </Flex>
          <Heatmap id='我的.排序选择' />
        </Popover>
      </Flex.Item>
      <Flex.Item>
        <Touchable onPress={$.toggleList}>
          <Flex style={styles.item} justify='center'>
            <Iconfont
              name='list'
              size={14}
              color={list ? _.colorMain : undefined}
            />
            <Iconfont
              style={_.ml.md}
              name='order'
              size={14}
              color={!list ? _.colorMain : undefined}
            />
          </Flex>
          <Heatmap id='我的.布局选择' />
        </Touchable>
      </Flex.Item>
    </Flex>
  )
}

ToolBar.contextTypes = {
  $: PropTypes.object
}

export default observer(ToolBar)

const memoStyles = _.memoStyles(_ => ({
  bg: {
    backgroundColor: _.colorBg
  },
  item: {
    paddingVertical: _.md - 4,
    paddingHorizontal: _.md
  },
  touchable: {
    paddingHorizontal: _.lg
  }
}))
