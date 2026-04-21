const STORAGE_KEY = 'youqinggong:assistant-draft-handoffs'
const MAX_HANDOFFS = 24
const HANDOFF_TTL_MS = 1000 * 60 * 60 * 12

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function hashString(value) {
  let hash = 5381
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index)
  }
  return Math.abs(hash >>> 0).toString(36)
}

function readStore() {
  if (!canUseStorage()) return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Ignore storage quota and serialization failures.
  }
}

function pruneStore(store) {
  const now = Date.now()
  const recentEntries = Object.entries(store).filter(([, value]) => {
    const savedAt = Date.parse(value?.savedAt || '')
    return !Number.isNaN(savedAt) && now - savedAt <= HANDOFF_TTL_MS
  })
  return Object.fromEntries(recentEntries.slice(-MAX_HANDOFFS))
}

export function createAssistantDraftHandoff(payload = {}) {
  const text = String(payload.text || '').trim()
  if (!text) return ''

  const surface = String(payload.surface || '').trim().toLowerCase()
  const token = `assistant-${hashString(JSON.stringify({
    text,
    surface,
    taskId: String(payload.taskId || '').trim(),
    roomKey: String(payload.roomKey || '').trim(),
    recordId: String(payload.recordId || '').trim(),
  }))}`

  const store = pruneStore(readStore())
  store[token] = {
    text,
    surface,
    savedAt: new Date().toISOString(),
  }
  writeStore(store)
  return token
}

export function peekAssistantDraftHandoff(token) {
  const nextToken = String(token || '').trim()
  if (!nextToken) return null
  const store = pruneStore(readStore())
  if (Object.keys(store).length) writeStore(store)
  return store[nextToken] || null
}

export function consumeAssistantDraftHandoff(token) {
  const nextToken = String(token || '').trim()
  if (!nextToken) return null
  const store = pruneStore(readStore())
  const payload = store[nextToken] || null
  if (payload) {
    delete store[nextToken]
    writeStore(store)
  }
  return payload
}
