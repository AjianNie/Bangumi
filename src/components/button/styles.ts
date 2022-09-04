/*
 * @Author: czy0729
 * @Date: 2022-05-03 15:49:12
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-08-31 19:11:11
 */
import { _ } from '@stores'
import { PAD } from '@constants'

const PAD_INCREASE = PAD === 2 ? 3 : 2

export const memoStyles = _.memoStyles(() => ({
  // base
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0
  },

  // type
  plain: {
    backgroundColor: _.select(_.colorPlain, _._colorDarkModeLevel1)
  },
  main: {
    backgroundColor: _.colorMain
  },
  primary: {
    backgroundColor: _.colorPrimary
  },
  warning: {
    backgroundColor: _.colorWarning
  },
  wait: {
    backgroundColor: _.colorWait
  },
  disabled: {
    backgroundColor: _.select(_.colorBg, _._colorDarkModeLevel2),
    opacity: 0.4
  },
  dropped: {
    backgroundColor: _.select(_.colorBg, 'rgb(96, 96, 96)')
  },
  bid: {
    backgroundColor: _.colorBid
  },
  ask: {
    backgroundColor: _.colorAsk
  },

  // ghost type
  ghostMain: {
    backgroundColor: _.select(_.colorMainLight, _._colorDarkModeLevel2),
    borderColor: _.select(_.colorMainBorder, _._colorDarkModeLevel2),
    borderWidth: _.select(_.hairlineWidth, 0)
  },
  ghostPrimary: {
    backgroundColor: _.select(_.colorPrimaryLight, _._colorDarkModeLevel1),
    borderColor: _.select(_.colorPrimaryBorder, _._colorDarkModeLevel1),
    borderWidth: _.select(_.hairlineWidth, 0)
  },
  ghostSuccess: {
    backgroundColor: _.select(_.colorSuccessLight, _._colorDarkModeLevel1),
    borderColor: _.select(_.colorSuccessBorder, _._colorDarkModeLevel1),
    borderWidth: _.select(_.hairlineWidth, 0)
  },
  ghostPlain: {
    backgroundColor: _.select(_.colorBg, _._colorDarkModeLevel2)
  },

  // size
  sm: {
    width: _.device(32, 44),
    height: _.device(32, 44)
  },
  md: {
    width: '100%',
    height: _.device(44, 50)
  },

  // text
  text: {
    fontSize: 14 + _.fontSizeAdjust + (_.isPad ? PAD_INCREASE : 0)
  },
  textSm: {
    fontSize: 12 + _.fontSizeAdjust + (_.isPad ? PAD_INCREASE : 0)
  },
  textPlain: {
    color: _.colorDesc
  },
  textMain: {
    color: _.__colorPlain__
  },
  textPrimary: {
    color: _.__colorPlain__
  },
  textWarning: {
    color: _.__colorPlain__
  },
  textWait: {
    color: _.__colorPlain__
  },
  textDisabled: {
    color: _.colorSub
  },
  textBid: {
    color: _.__colorPlain__
  },
  textAsk: {
    color: _.__colorPlain__
  },
  textGhostPlain: {
    color: _.colorSub
  },
  textGhostMain: {
    color: _.select(_.colorSub, _.colorMain)
  },
  textGhostPrimary: {
    color: _.colorSub
  },
  textGhostSuccess: {
    color: _.select(_.colorSub, _.colorSuccess)
  },

  // other
  shadow: {
    shadowColor: _.colorShadow,
    shadowOffset: {
      width: 1,
      height: 3
    },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 3
  },
  radius: {
    borderRadius: _.radiusXs,
    overflow: _.ios(undefined, 'hidden')
  },
  scale: {
    transform: [
      {
        scale: 0.64
      }
    ]
  },
  androidFixed: {
    width: 32
  }
}))
