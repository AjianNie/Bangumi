/*
 * @Author: czy0729
 * @Date: 2022-12-03 10:16:04
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-12-08 15:41:41
 */
import React from 'react'
import { Page, Loading } from '@components'
import { ic } from '@utils/decorators'
import { useMount, useObserver } from '@utils/hooks'
import Header from './header'
import Upload from './upload'
import Cloud from './cloud'
import List from './list'
import Tips from './tips'
import Store from './store'
import { Ctx } from './types'

const Backup = (props, { $ }: Ctx) => {
  useMount(() => {
    $.init()
  })

  return useObserver(() => {
    const { progress } = $.state
    return (
      <>
        <Header />
        <Page>
          <Upload />
          <Cloud />
          {progress.fetching ? <Loading /> : <List />}
        </Page>
        <Tips />
      </>
    )
  })
}

export default ic(Store, Backup)
