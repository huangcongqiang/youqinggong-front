export const PAST_INTERVIEW_TIME_MESSAGE = '面试时间不能早于当前时间。';

export function parseKnownInterviewTime(value: string) {
  const match = value
    .trim()
    .replace('T', ' ')
    .match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute, second = '0'] = match;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  if (
    parsed.getFullYear() !== Number(year)
    || parsed.getMonth() !== Number(month) - 1
    || parsed.getDate() !== Number(day)
    || parsed.getHours() !== Number(hour)
    || parsed.getMinutes() !== Number(minute)
  ) {
    return null;
  }
  return parsed;
}

export function isKnownInterviewTimeInPast(value: string, now = Date.now()) {
  const parsed = parseKnownInterviewTime(value);
  return parsed !== null && parsed.getTime() < now - 60_000;
}
