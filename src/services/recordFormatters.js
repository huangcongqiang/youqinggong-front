export function formatMoney(amount) {
  return `¥${new Intl.NumberFormat('zh-CN').format(Number(amount) || 0)}`;
}

export function formatDateLabel(value) {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) {
    return '待同步';
  }

  const date = normalizedValue.includes('T') ? new Date(normalizedValue) : new Date(`${normalizedValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
    .format(date)
    .replace(/\//g, '.');
}

export function formatDateRangeLabel(startAt, endAt) {
  const startLabel = formatDateLabel(startAt);
  const endLabel = formatDateLabel(endAt);

  if (startLabel === '待同步' && endLabel === '待同步') {
    return '待同步';
  }
  if (startLabel === '待同步') {
    return endLabel;
  }
  if (endLabel === '待同步' || startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel} - ${endLabel}`;
}

export function formatGrade(value) {
  if (!value) {
    return '待评分';
  }

  if (value === '待评级' || value === '待评分') {
    return value;
  }

  return `${value} 级`;
}
