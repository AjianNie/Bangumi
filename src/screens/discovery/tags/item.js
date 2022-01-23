/*
 * @Author: czy0729
 * @Date: 2019-10-03 15:46:57
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-01-23 14:59:49
 */
import React from 'react'
import { Touchable, Text, Flex, Heatmap } from '@components'
import { _, systemStore } from '@stores'
import { formatNumber } from '@utils'
import { obc } from '@utils/decorators'
import { HTMLDecode } from '@utils/html'
import { t } from '@utils/fetch'

function Item({ type, name, nums, index }, { navigation }) {
  const styles = memoStyles()
  const { coverRadius } = systemStore.setting
  let numsText = nums
  if (nums > 10000) numsText = `${formatNumber(nums / 10000, 1)}w`

  const num = _.num(4)
  const tag = HTMLDecode(name)
  return (
    <Touchable
      style={[
        styles.container,
        (_.isPad || _.isLandscape) && !(index % num) && _.container.left,
        {
          borderRadius: coverRadius
        }
      ]}
      onPress={() => {
        t('标签索引.跳转', {
          to: 'Tag',
          type,
          tag
        })
        navigation.push('Tag', {
          type,
          tag
        })
      }}
    >
      <Flex style={styles.item} direction='column' justify='center'>
        <Text align='center' size={12} bold numberOfLines={3}>
          {tag}
        </Text>
        <Text style={_.mt.xs} type='sub' align='center' size={11}>
          {numsText}
        </Text>
      </Flex>
      {index === 0 && <Heatmap id='标签索引.跳转' />}
    </Touchable>
  )
}

export default obc(Item)

const memoStyles = _.memoStyles(() => {
  const { width, marginLeft } = _.grid(_.num(4))
  return {
    container: {
      marginBottom: _.md,
      marginLeft,
      overflow: 'hidden',
      borderWidth: _.hairlineWidth,
      borderColor: _.colorBorder,
      backgroundColor: _.select(_.colorBg, _._colorDarkModeLevel1)
    },
    item: {
      width,
      height: width
    }
  }
})
