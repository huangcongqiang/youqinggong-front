import { getIntlLocale, normalizeUiLocale, readPreferredUiLocale, translateText } from './uiLocale.js'

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

assert(normalizeUiLocale('zh-CN') === 'zh', 'zh locales should normalize to zh')
assert(normalizeUiLocale('en-US') === 'en', 'non-zh locales should normalize to en')
assert(getIntlLocale('zh') === 'zh-CN', 'zh locale should resolve to zh-CN')
assert(getIntlLocale('en') === 'en-US', 'en locale should resolve to en-US')
assert(
  readPreferredUiLocale({
    documentLike: {
      documentElement: {
        lang: 'zh-CN',
        getAttribute(name) {
          return name === 'data-ui-locale' ? null : null
        },
      },
    },
    navigatorLike: { language: 'en-US' },
  }) === 'zh',
  'document language should win over browser language for the default UI locale'
)
assert(translateText('Review', 'zh') === '审核', 'review should translate to zh')
assert(translateText('审核', 'en') === 'Review', 'review should translate to en')
assert(translateText('3 / 5 questions answered', 'zh') === '3 / 5 个问题已回答', 'question counts should translate to zh')
assert(translateText('打开结算以处理发票', 'en') === 'Open settlement for invoice', 'settlement action should translate to en')
assert(
  translateText('当前暂时无法提交评分，请稍后再试。', 'en') === 'Unable to submit rating right now, Please try again later.',
  'high-frequency error copy should translate by fragments'
)
