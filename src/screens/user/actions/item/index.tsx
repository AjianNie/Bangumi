/*
 * @Author: czy0729
 * @Date: 2022-11-24 05:47:08
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-11-24 05:56:39
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Text, Iconfont } from '@components'
import { Popover, Tag } from '@_'
import { _ } from '@stores'
import { confirm } from '@utils'
import { obc } from '@utils/decorators'
import Form from '../form'
import { Ctx } from '../types'
import { styles } from './styles'

const Item = ({ uuid, active, name, url, sort }, { $ }: Ctx) => {
  const actions = []
  const isActive = !!active
  actions.push('编辑', isActive ? '停用' : '启用', '删除', '测试')

  const { edit } = $.state
  const isEdit = edit.show && uuid && edit.uuid === uuid
  return (
    <>
      <Flex style={[styles.item, !isActive && styles.disabled]}>
        <Flex.Item>
          <Text size={15} bold>
            {name}
          </Text>
          <Flex style={_.mt.sm}>
            {sort >= 0 && <Tag style={_.mr.sm} value={sort} />}
            <Flex.Item>
              <Text size={12} type='sub' numberOfLines={1}>
                {url}
              </Text>
            </Flex.Item>
          </Flex>
        </Flex.Item>
        {isActive && <Tag style={_.ml.md} value='生效' />}
        <Popover
          style={_.ml.md}
          data={actions}
          onSelect={title => {
            switch (title) {
              case '编辑':
                $.openEdit({
                  uuid,
                  name,
                  url,
                  sort,
                  active
                })
                break

              case '删除':
                confirm(`确定删除 [${name}] ?`, () => {
                  $.deleteItem({
                    uuid
                  })
                })
                break

              case '停用':
                $.disableItem({
                  uuid
                })
                break

              case '启用':
                $.activeItem({
                  uuid
                })
                break

              case '测试':
                $.go({
                  url
                })
                break

              default:
                break
            }
          }}
        >
          <View style={styles.touch}>
            <Iconfont name='md-more-vert' color={_.colorDesc} />
          </View>
        </Popover>
      </Flex>
      {isEdit && <Form name={name} url={url} />}
    </>
  )
}

export default obc(Item)
