import { getIntlLocale, getUiLocale, translateText } from '../utils/uiLocale.js'

export function formatMoney(amount) {
  return `¥${new Intl.NumberFormat(getIntlLocale()).format(Number(amount) || 0)}`
}

export function formatDateLabel(value) {
  const normalizedValue = String(value || '').trim()
  const pendingLabel = translateText('Pending sync')
  if (!normalizedValue) {
    return pendingLabel
  }

  const date = normalizedValue.includes('T') ? new Date(normalizedValue) : new Date(`${normalizedValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return translateText(normalizedValue)
  }

  if (getUiLocale() === 'zh') {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
      .format(date)
      .replace(/\//g, '.')
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function formatDateRangeLabel(startAt, endAt) {
  const pendingLabel = translateText('Pending sync')
  const startLabel = formatDateLabel(startAt)
  const endLabel = formatDateLabel(endAt)

  if (startLabel === pendingLabel && endLabel === pendingLabel) {
    return pendingLabel
  }
  if (startLabel === pendingLabel) {
    return endLabel
  }
  if (endLabel === pendingLabel || startLabel === endLabel) {
    return startLabel
  }

  return `${startLabel} - ${endLabel}`
}

export function formatGrade(value) {
  const pendingLabel = translateText('Pending rating')
  if (!value) {
    return pendingLabel
  }

  if (value === '待评级' || value === '待评分' || value === 'Pending rating') {
    return pendingLabel
  }

  return getUiLocale() === 'zh' ? `${translateText(String(value))} 级` : translateText(String(value))
}
