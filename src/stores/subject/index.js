/*
 * 条目
 * @Author: czy0729
 * @Date: 2019-02-27 07:47:57
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-04-06 02:37:20
 */
import { observable, computed } from 'mobx'
import { LIST_EMPTY, LIMIT_LIST_COMMENTS } from '@constants'
import { API_SUBJECT, API_SUBJECT_EP } from '@constants/api'
import { CDN_SUBJECT, CDN_MONO } from '@constants/cdn'
import {
  HTML_EP,
  HTML_MONO_VOICES,
  HTML_MONO_WORKS,
  HTML_SUBJECT,
  HTML_SUBJECT_COMMENTS,
  HTML_SUBJECT_CATALOGS,
  HTML_SUBJECT_RATING,
  HTML_SUBJECT_WIKI_EDIT,
  HTML_SUBJECT_WIKI_COVER
} from '@constants/html'
import { getTimestamp } from '@utils'
import { HTMLTrim, HTMLDecode } from '@utils/html'
import store from '@utils/store'
import { fetchHTML, xhrCustom } from '@utils/fetch'
import {
  NAMESPACE,
  DEFAULT_RATING_STATUS,
  INIT_SUBJECT,
  INIT_SUBJECT_FROM_HTML_ITEM,
  INIT_SUBJECT_FROM_CDN_ITEM,
  INIT_MONO,
  INIT_MONO_WORKS,
  INIT_SUBJECT_WIKI
} from './init'
import {
  fetchMono,
  cheerioSubjectFormHTML,
  cheerioMonoWorks,
  cheerioMonoVoices,
  cheerioRating,
  cheerioSubjectCatalogs,
  cheerioWikiEdits,
  cheerioWikiCovers
} from './common'

class Subject extends store {
  /**
   * @update 2022/04/06 subject和subjectFormHTML根据id最后一位拆开10个key存放
   *         避免JSON.stringify后长度太长, 存(取)本地不能
   */
  state = observable({
    /**
     * 条目
     * @param {*} subjectId
     */
    subject0: {},
    subject1: {},
    subject2: {},
    subject3: {},
    subject4: {},
    subject5: {},
    subject6: {},
    subject7: {},
    subject8: {},
    subject9: {},

    /**
     * 条目HTML
     * @param {*} subjectId
     */
    subjectFormHTML0: {},
    subjectFormHTML1: {},
    subjectFormHTML2: {},
    subjectFormHTML3: {},
    subjectFormHTML4: {},
    subjectFormHTML5: {},
    subjectFormHTML6: {},
    subjectFormHTML7: {},
    subjectFormHTML8: {},
    subjectFormHTML9: {},

    /**
     * 条目CDN自维护数据
     * 用于条目首次渲染加速
     * @param {*} subjectId
     */
    subjectFormCDN: {
      0: INIT_SUBJECT_FROM_CDN_ITEM
    },

    /**
     * [待废弃] 条目章节
     * @param {*} subjectId
     */
    subjectEp: {
      0: {}
    },

    /**
     * 包含条目的目录
     * @param {*} subjectId
     */
    subjectCatalogs: {
      0: LIST_EMPTY
    },

    /**
     * 条目吐槽箱
     * @param {*} subjectId
     */
    subjectComments: {
      0: LIST_EMPTY
    },

    /**
     * 章节内容
     * @param {*} epId
     */
    epFormHTML: {
      0: ''
    },

    /**
     * 人物
     * @param {*} monoId
     */
    mono: {
      0: INIT_MONO
    },

    /**
     * 人物吐槽箱
     * @param {*} monoId
     */
    monoComments: {
      0: LIST_EMPTY // <INIT_MONO_COMMENTS_ITEM>
    },

    /**
     * 人物CDN自维护数据
     * 用于人物首次渲染加速
     * @param {*} monoId
     */
    monoFormCDN: {
      0: INIT_MONO
    },

    /**
     * 人物作品
     * @param {*} monoId
     * https://bgm.tv/person/8138/works
     */
    monoWorks: {
      0: INIT_MONO_WORKS
    },

    /**
     * 人物角色列表
     * @param {*} monoId
     * https://bgm.tv/person/8138/works/voice
     */
    monoVoices: {
      0: INIT_MONO_WORKS
    },

    /**
     * 好友评分列表
     */
    rating: {
      _: (subjectId = 0, status = DEFAULT_RATING_STATUS, isFriend = false) =>
        `${subjectId}|${status}|${isFriend}`,
      0: {
        ...LIST_EMPTY,
        counts: {
          wishes: 0,
          collections: 0,
          doings: 0,
          on_hold: 0,
          dropped: 0
        }
      }
    },

    /**
     * wiki修订历史
     */
    wiki: {
      0: INIT_SUBJECT_WIKI
    },

    /**
     * 自定义源头数据
     */
    origin: {
      base: {},
      custom: {
        anime: [],
        hanime: [],
        manga: [],
        wenku: [],
        music: [],
        game: [],
        real: []
      }
    }
  })

  init = () =>
    this.readStorage(
      [
        // subject 拆store
        'subject0',
        'subject1',
        'subject2',
        'subject3',
        'subject4',
        'subject5',
        'subject6',
        'subject7',
        'subject8',
        'subject9',

        // subjectFormHTML 拆store
        'subjectFormHTML0',
        'subjectFormHTML1',
        'subjectFormHTML2',
        'subjectFormHTML3',
        'subjectFormHTML4',
        'subjectFormHTML5',
        'subjectFormHTML6',
        'subjectFormHTML7',
        'subjectFormHTML8',
        'subjectFormHTML9',

        // other
        'subjectComments',
        'subjectCatalogs',
        'mono',
        'monoComments',
        'monoWorks',
        'monoVoices',
        'rating',
        'origin'
      ],
      NAMESPACE
    )

  // -------------------- get --------------------
  /**
   * 条目, 合并subject0-9
   */
  subject(subjectId) {
    return computed(() => {
      if (!subjectId) return INIT_SUBJECT

      const str = String(subjectId)
      const last = str.charAt(str.length - 1)
      return this.state?.[`subject${last}`]?.[subjectId] || INIT_SUBJECT
    }).get()
  }

  /**
   * 条目HTML, 合并subject0-9
   */
  subjectFormHTML(subjectId) {
    return computed(() => {
      if (!subjectId) return INIT_SUBJECT_FROM_HTML_ITEM

      const str = String(subjectId)
      const last = str.charAt(str.length - 1)
      return (
        this.state?.[`subjectFormHTML${last}`]?.[subjectId] ||
        INIT_SUBJECT_FROM_HTML_ITEM
      )
    }).get()
  }

  // -------------------- fetch --------------------
  /**
   * 条目信息
   * @param {*} subjectId
   */
  fetchSubject = subjectId => {
    const str = String(subjectId)
    const last = str.charAt(str.length - 1)
    return this.fetch(
      {
        url: API_SUBJECT(subjectId),
        data: {
          responseGroup: 'large'
        },
        info: '条目信息'
      },
      [`subject${last}`, subjectId],
      {
        storage: true,
        namespace: NAMESPACE
      }
    )
  }

  /**
   * 网页获取条目信息
   * @param {*} subjectId
   * @param {*} cdn 是否请求自建cdn
   */
  fetchSubjectFormHTML = async subjectId => {
    const HTML = await fetchHTML({
      url: HTML_SUBJECT(subjectId)
    })

    const str = String(subjectId)
    const last = str.charAt(str.length - 1)
    const key = `subjectFormHTML${last}`
    const data = {
      ...cheerioSubjectFormHTML(HTML),
      _loaded: getTimestamp()
    }
    this.setState({
      [key]: {
        [subjectId]: data
      }
    })

    this.setStorage(key, undefined, NAMESPACE)
    return Promise.resolve(data)
  }

  /**
   * CDN获取条目信息
   * @param {*} subjectId
   */
  fetchSubjectFormCDN = async subjectId => {
    try {
      const { _response } = await xhrCustom({
        url: CDN_SUBJECT(subjectId)
      })

      const data = {
        ...INIT_SUBJECT_FROM_CDN_ITEM,
        ...JSON.parse(_response)
      }
      const key = 'subjectFormCDN'
      this.setState({
        [key]: {
          [subjectId]: data
        }
      })
      return Promise.resolve(data)
    } catch (error) {
      warn('subjectStore', 'fetchSubjectFormCDN', 404)
      return Promise.resolve(INIT_SUBJECT_FROM_CDN_ITEM)
    }
  }

  /**
   * 章节数据
   * @param {*} subjectId
   */
  fetchSubjectEp = subjectId =>
    this.fetch(
      {
        url: API_SUBJECT_EP(subjectId),
        info: '章节数据'
      },
      ['subjectEp', subjectId],
      {
        storage: true,
        namespace: NAMESPACE
      }
    )

  /**
   * 包含条目的目录
   * @param {*} subjectId
   */
  fetchSubjectCatalogs = async ({ subjectId }, refresh) => {
    const key = 'subjectCatalogs'
    const limit = 15
    const { list, pagination } = this[key](subjectId)
    const page = refresh ? 1 : pagination.page + 1

    const html = await fetchHTML({
      url: HTML_SUBJECT_CATALOGS(subjectId, page)
    })
    const { list: _list } = cheerioSubjectCatalogs(html)
    this.setState({
      [key]: {
        [subjectId]: {
          list: refresh ? _list : [...list, ..._list],
          pagination: {
            page,
            pageTotal: _list.length === limit ? 100 : page
          },
          _loaded: getTimestamp()
        }
      }
    })
    this.setStorage(key, undefined, NAMESPACE)

    return this[key](subjectId)
  }

  /**
   * 网页获取留言
   * @param {*} subjectId
   * @param {*} refresh 是否重新获取
   * @param {*} reverse 是否倒序
   */
  fetchSubjectComments = async ({ subjectId }, refresh, reverse) => {
    const { list, pagination, _reverse } = this.subjectComments(subjectId)
    let page // 下一页的页码

    // @notice 倒序的实现逻辑: 默认第一次是顺序, 所以能拿到总页数
    // 点击倒序根据上次数据的总页数开始递减请求, 处理数据时再反转入库
    let isReverse = reverse
    if (!isReverse && !refresh) {
      isReverse = _reverse
    }

    if (isReverse) {
      if (refresh) {
        // @issue 官网某些条目留言不知道为什么会多出一页空白
        page = pagination.pageTotal - 1
      } else {
        page = pagination.page - 1
      }
    } else if (refresh) {
      page = 1
    } else {
      page = pagination.page + 1
    }

    // -------------------- 请求HTML --------------------
    const res = fetchHTML({
      url: HTML_SUBJECT_COMMENTS(subjectId, page)
    })
    const raw = await res
    const html = raw.replace(/ {2}|&nbsp;/g, ' ').replace(/\n/g, '')
    const commentsHTML = html.match(
      /<div id="comment_box">(.+?)<\/div><\/div><div class="section_line clear">/
    )

    // -------------------- 分析HTML --------------------
    // @todo 使用新的HTML解释函数重写
    const comments = []
    let { pageTotal = 0 } = pagination
    if (commentsHTML) {
      /**
       * 总页数
       *
       * [1] 超过10页的, 有总页数
       * [2] 少于10页的, 需要读取最后一个分页按钮获取页数
       * [3] 只有1页, 没有分页按钮
       */
      if (page === 1) {
        const pageHTML =
          html.match(/<span class="p_edge">\( \d+ \/ (\d+) \)<\/span>/) ||
          html.match(
            /<a href="\?page=(\d+)" class="p">10<\/a><a href="\?page=2" class="p">&rsaquo;&rsaquo;<\/a>/
          )
        if (pageHTML) {
          pageTotal = pageHTML[1]
        } else {
          pageTotal = 1
        }
      }

      // 留言
      let items = commentsHTML[1].split('<div class="item clearit">')
      items.shift()

      if (isReverse) {
        items = items.reverse()
      }
      items.forEach((item, index) => {
        const userId = item.match(
          /<div class="text"><a href="\/user\/(.+?)" class="l">/
        )
        const userName = item.match(/" class="l">(.+?)<\/a> <small class="grey">/)
        const avatar = item.match(/background-image:url\('(.+?)'\)"><\/span>/)
        const time = item.match(/<small class="grey">@(.+?)<\/small>/)
        const star = item.match(/starlight stars(.+?)"/)
        const comment = item.match(/<p>(.+?)<\/p>/)
        comments.push({
          id: `${page}|${index}`,
          userId: userId ? userId[1] : '',
          userName: userName ? HTMLDecode(userName[1]) : '',
          avatar: avatar ? avatar[1] : '',
          time: time ? time[1].trim() : '',
          star: star ? star[1] : '',
          comment: comment ? HTMLDecode(comment[1]) : ''
        })
      })
    }

    // -------------------- 缓存 --------------------
    const key = 'subjectComments'
    this.setState({
      [key]: {
        [subjectId]: {
          list: refresh ? comments : [...list, ...comments],
          pagination: {
            page,
            pageTotal: parseInt(pageTotal)
          },
          _loaded: getTimestamp(),
          _reverse: isReverse
        }
      }
    })
    this.setStorage(key, undefined, NAMESPACE)
    return res
  }

  /**
   * 章节内容
   * @param {*} epId
   */
  fetchEpFormHTML = async epId => {
    // -------------------- 请求HTML --------------------
    const res = fetchHTML({
      url: `!${HTML_EP(epId)}`
    })
    const raw = await res
    const HTML = HTMLTrim(raw)

    // -------------------- 分析HTML --------------------
    const contentHTML = HTML.match(/<div class="epDesc">(.+?)<\/div>/)
    if (contentHTML) {
      this.setState({
        epFormHTML: {
          [epId]: contentHTML[0]
        }
      })
    }

    return res
  }

  /**
   * 人物信息和吐槽箱
   * 为了提高体验, 吐槽箱做模拟分页加载效果, 逻辑与超展开回复一致
   * @param {*} monoId
   */
  fetchMono = async ({ monoId }, refresh) => {
    let res
    const monoKey = 'mono'
    const commentsKey = 'monoComments'
    const stateKey = monoId

    if (refresh) {
      // 重新请求
      res = fetchMono({ monoId })
      const { mono, monoComments } = await res
      const _loaded = getTimestamp()

      // 缓存人物信息
      this.setState({
        [monoKey]: {
          [stateKey]: {
            ...mono,
            _loaded
          }
        }
      })
      this.setStorage(monoKey, undefined, NAMESPACE)

      // 缓存吐槽箱
      this.setState({
        [commentsKey]: {
          [stateKey]: {
            list: monoComments.slice(0, LIMIT_LIST_COMMENTS),
            pagination: {
              page: 1,
              pageTotal: Math.ceil(monoComments.length / LIMIT_LIST_COMMENTS)
            },
            _list: monoComments,
            _loaded
          }
        }
      })
      this.setStorage(commentsKey, undefined, NAMESPACE)
    } else {
      // 加载下一页留言
      const monoComments = this.monoComments(monoId)
      const page = monoComments.pagination.page + 1
      this.setState({
        [commentsKey]: {
          [stateKey]: {
            ...monoComments,
            list: monoComments._list.slice(0, LIMIT_LIST_COMMENTS * page),
            pagination: {
              ...monoComments.pagination,
              page
            }
          }
        }
      })
      this.setStorage(commentsKey, undefined, NAMESPACE)
    }
    return res
  }

  /**
   * CDN获取人物信息
   * @param {*} subjectId
   */
  fetchMonoFormCDN = async monoId => {
    try {
      const { _response } = await xhrCustom({
        url: CDN_MONO(
          monoId.replace(/character\/|person\//g, ''),
          monoId.includes('character') ? 'data' : 'person'
        )
      })

      const data = {
        ...INIT_MONO,
        ...JSON.parse(_response)
      }
      const key = 'monoFormCDN'
      this.setState({
        [key]: {
          [monoId]: data
        }
      })
      return Promise.resolve(data)
    } catch (error) {
      warn('subjectStore', 'fetchMonoFormCDN', 404)
      return Promise.resolve(INIT_MONO)
    }
  }

  /**
   * 人物作品
   */
  fetchMonoWorks = async ({ monoId, position, order } = {}, refresh) => {
    const key = 'monoWorks'
    const limit = 24
    const { list, pagination } = this[key](monoId)
    const page = refresh ? 1 : pagination.page + 1

    const html = await fetchHTML({
      url: HTML_MONO_WORKS(monoId, position, order, page)
    })
    const { list: _list, filters } = cheerioMonoWorks(html)
    this.setState({
      [key]: {
        [monoId]: {
          list: refresh ? _list : [...list, ..._list],
          pagination: {
            page,
            pageTotal: _list.length === limit ? 100 : page
          },
          filters,
          _loaded: getTimestamp()
        }
      }
    })
    this.setStorage(key, undefined, NAMESPACE)

    return this[key](monoId)
  }

  /**
   * 人物角色
   */
  fetchMonoVoices = async ({ monoId, position, order } = {}) => {
    const key = 'monoVoices'
    const html = await fetchHTML({
      url: HTML_MONO_VOICES(monoId, position, order)
    })
    const { list, filters } = cheerioMonoVoices(html)
    this.setState({
      [key]: {
        [monoId]: {
          list,
          pagination: {
            page: 1,
            pageTotal: 1
          },
          filters,
          _loaded: getTimestamp()
        }
      }
    })
    this.setStorage(key, undefined, NAMESPACE)

    return this[key](monoId)
  }

  /**
   * 所有人评分
   */
  fetchRating = async (
    { subjectId = 0, status = DEFAULT_RATING_STATUS, isFriend = false } = {},
    refresh
  ) => {
    const key = 'rating'
    const stateKey = `${subjectId}|${status}|${isFriend}`
    const limit = 20
    const { list, pagination } = this[key](subjectId, status, isFriend)
    const page = refresh ? 1 : pagination.page + 1

    const html = await fetchHTML({
      url: HTML_SUBJECT_RATING(subjectId, status, isFriend, page)
    })
    const { list: _list, counts } = cheerioRating(html)
    this.setState({
      [key]: {
        [stateKey]: {
          list: refresh ? _list : [...list, ..._list],
          pagination: {
            page,
            pageTotal: _list.length === limit ? 100 : page
          },
          counts,
          _loaded: getTimestamp()
        }
      }
    })
    this.setStorage(key, undefined, NAMESPACE)

    return this[key](subjectId, status, isFriend)
  }

  /**
   * wiki修订历史
   */
  fetchWiki = async ({ subjectId }) => {
    const key = 'wiki'
    const htmlEdit = await fetchHTML({
      url: HTML_SUBJECT_WIKI_EDIT(subjectId)
    })
    const { list: edits } = cheerioWikiEdits(htmlEdit)

    const htmlCover = await fetchHTML({
      url: HTML_SUBJECT_WIKI_COVER(subjectId)
    })
    const { list: covers } = cheerioWikiCovers(htmlCover)

    this.setState({
      [key]: {
        [subjectId]: {
          edits,
          covers: covers.reverse(),
          _loaded: getTimestamp()
        }
      }
    })
    return this[key](subjectId)
  }

  // -------------------- page --------------------
  /**
   * 更新源头数据
   */
  updateOrigin = data => {
    const key = 'origin'
    this.setState({
      [key]: data
    })
    this.setStorage(key, undefined, NAMESPACE)
  }
}

const Store = new Subject()
Store.setup()

export default Store
