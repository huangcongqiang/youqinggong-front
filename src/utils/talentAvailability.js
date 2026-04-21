function normalizeAvailabilityItem(item) {
  return String(item || '').trim();
}

export function formatTalentAvailability(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeAvailabilityItem).filter(Boolean).join(' / ');
  }

  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('[') && normalized.endsWith(']')) {
    try {
      const parsed = JSON.parse(normalized);
      if (Array.isArray(parsed)) {
        return formatTalentAvailability(parsed);
      }
    } catch {
      return normalized;
    }
  }

  return normalized;
}
