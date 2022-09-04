/*
 * @Author: czy0729
 * @Date: 2022-05-25 17:20:56
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-04 03:39:48
 */
import { HTMLDecode } from '@utils'
import { DEFAULT_PROPS } from './ds'

export function getPopoverData(
  item: { comment: any; name_cn: any; name: any; id: string | number },
  isSp: boolean,
  canPlay: boolean,
  login: boolean,
  advance: boolean,
  userProgress: { [x: string]: string }
) {
  const discuss = HTMLDecode(
    `(+${item.comment}) ${item.name_cn || item.name || '本集讨论'}`
  )

  let data: string[]
  if (login) {
    data = [userProgress[item.id] === '看过' ? '撤销' : '看过']
    if (!isSp) data.push('看到')
    if (advance) data.push('想看', '抛弃')
    data.push(discuss)
  } else {
    data = [discuss]
  }

  if (canPlay) data.push('正版播放')

  return data
}

export function getType(progress: any, status: any) {
  switch (progress) {
    case '想看':
      return 'main'

    case '看过':
      return 'primary'

    case '抛弃':
      return 'dropped'

    default:
      break
  }

  switch (status) {
    case 'Air':
      return 'ghostPlain'

    case 'Today':
      return 'ghostSuccess'

    default:
      return 'disabled'
  }
}

export function getComment(eps: any[]) {
  return {
    min: Math.min(...eps.map(item => item.comment || 1).filter(item => !!item)),
    max: Math.max(...eps.map(item => item.comment || 1))
  }
}

export function customCompare({ props, item, eps, isSp, num }: typeof DEFAULT_PROPS) {
  const { userProgress, ...otherProps } = props
  return {
    props: otherProps,
    userProgress: userProgress[item?.id],
    item,
    eps: eps?.length,
    isSp,
    num
  }
}
