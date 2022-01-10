/*
 * @Author: czy0729
 * @Date: 2019-05-15 02:20:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-01-10 12:07:10
 */
import { observable, computed } from 'mobx'
import { searchStore, userStore, collectionStore } from '@stores'
import { open } from '@utils'
import store from '@utils/store'
import { x18 } from '@utils/app'
import { info } from '@utils/ui'
import { t } from '@utils/fetch'
import { MODEL_SEARCH_CAT, MODEL_SEARCH_LEGACY } from '@constants/model'
import { HTML_SEARCH } from '@constants/html'

const namespace = 'ScreenSearch'
const initCat = MODEL_SEARCH_CAT.getValue('动画')
const initLegacy = MODEL_SEARCH_LEGACY.getValue('精确')
const excludeState = {
  value: '',
  searching: false
}

export default class ScreenSearch extends store {
  state = observable({
    history: [],
    cat: initCat,
    legacy: initLegacy, // 是否精准查询
    ...excludeState,
    _loaded: false
  })

  setParams = navigation => {
    navigation.setParams({
      heatmap: '搜索.右上角菜单',
      popover: {
        data: ['浏览器查看'],
        onSelect: key => {
          t('搜索.右上角菜单', {
            key
          })

          switch (key) {
            case '浏览器查看':
              open(this.url)
              break

            default:
              break
          }
        }
      }
    })
  }

  init = async () => {
    const res = this.getStorage(undefined, namespace)
    const state = await res
    this.setState({
      ...state,
      ...excludeState,
      _loaded: true
    })

    this.initState()
    return res
  }

  // -------------------- get --------------------
  search() {
    const { cat, legacy, value } = this.state
    return computed(() => {
      const search = searchStore.search(value, cat, legacy)
      if (userStore.isLimit) {
        return {
          ...search,
          list: search.list.filter(item => !x18(item.id))
        }
      }
      return search
    }).get()
  }

  @computed get userCollectionsMap() {
    return collectionStore.userCollectionsMap
  }

  @computed get url() {
    const { value = '', cat, legacy = '' } = this.state
    const _text = value.replace(/ /g, '+')
    const url = HTML_SEARCH(_text, cat, 1, legacy)
    return url
  }

  @computed get isUser() {
    const { cat } = this.state
    const label = MODEL_SEARCH_CAT.getLabel(cat)
    return label === '用户'
  }

  // -------------------- page --------------------
  /**
   * 处理初始参数
   */
  initState = () => {
    const { _type, _value } = this.params
    if (_type) {
      this.onSelect(_type)
    }

    if (_value) {
      this.onChange({
        nativeEvent: {
          text: String(_value)
        }
      })
      this.doSearch()
    }
  }

  onSelect = label => {
    const { cat } = this.state
    const nextCat = MODEL_SEARCH_CAT.getValue(label)
    if (nextCat !== cat) {
      t('搜索.切换类型', {
        cat: nextCat
      })

      this.setState({
        cat: nextCat
      })
      this.setStorage(undefined, undefined, namespace)

      const { value } = this.state
      if (value) {
        this.doSearch()
      }
    }
  }

  onLegacySelect = label => {
    const { legacy } = this.state
    const nextLegacy = MODEL_SEARCH_LEGACY.getValue(label)
    if (nextLegacy !== legacy) {
      t('搜索.切换细分类型', {
        legacy: nextLegacy
      })

      this.setState({
        legacy: nextLegacy
      })
      this.setStorage(undefined, undefined, namespace)

      const { value } = this.state
      if (value) {
        this.doSearch()
      }
    }
  }

  onChange = ({ nativeEvent }) => {
    const { text } = nativeEvent
    this.setState({
      value: text
    })
  }

  selectHistory = value => {
    t('搜索.选择历史', {
      value
    })

    this.setState({
      value
    })
  }

  deleteHistory = value => {
    t('搜索.删除历史', {
      value
    })

    const { history } = this.state
    this.setState({
      history: history.filter(item => item !== value)
    })
    this.setStorage(undefined, undefined, namespace)
  }

  onSubmit = navigation => {
    if (this.isUser) {
      const { value } = this.state
      if (!value) return info('请输入完整的用户Id')

      return navigation.push('Zone', {
        userId: value
      })
    }

    return this.doSearch(true)
  }

  // -------------------- action --------------------
  doSearch = async refresh => {
    const { history, cat, legacy, value } = this.state
    if (value === '') {
      info('请输入内容')
      return
    }

    t('搜索.搜索', {
      cat,
      value
    })

    const _history = [...history]
    if (!history.includes(value)) {
      _history.unshift(value)
    }
    if (refresh) {
      if (_history.length > 10) {
        _history.pop()
      }
      this.setState({
        history: _history,
        searching: true
      })
      this.setStorage(undefined, undefined, namespace)
    }

    try {
      await searchStore.fetchSearch(
        {
          cat,
          legacy,
          text: value
        },
        refresh
      )
    } catch (ex) {
      info('请稍候再查询')
    }

    if (refresh) {
      this.setState({
        searching: false
      })
    }
  }
}
