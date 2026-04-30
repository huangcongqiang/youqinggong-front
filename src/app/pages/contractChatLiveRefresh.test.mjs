import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const currentDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(currentDir, 'ContractChat.tsx'), 'utf8');
const realtimeSource = readFileSync(resolve(currentDir, '../services/realtime.ts'), 'utf8');

assert.match(source, /useCallback/, 'ContractChat should keep room refresh callback stable for polling.');
assert.match(source, /window\.setInterval\(refreshVisibleRoom,\s*6000\)/, 'ContractChat should poll the active room while visible.');
assert.match(source, /visibilitychange/, 'ContractChat should refresh active room when the tab becomes visible.');
assert.match(source, /window\.addEventListener\('focus',\s*refreshVisibleRoom\)/, 'ContractChat should refresh active room on window focus.');
assert.match(source, /refreshActiveRoom\(\{\s*silent:\s*true\s*\}\)/, 'Background refresh should avoid replacing the current user-facing notice.');
assert.match(source, /openBusinessEventStream/, 'ContractChat should subscribe to backend realtime events for message refresh.');
assert.match(source, /eventScope === 'messages'/, 'ContractChat should react to message-scoped realtime events.');
assert.match(source, /refreshRoomsSilently/, 'Realtime message events should refresh the room list as well as detail.');
assert.match(realtimeSource, /Accept:\s*"text\/event-stream"/, 'Realtime client should request the SSE stream.');
assert.match(realtimeSource, /buildAuthHeaders\(getStoredAuthToken/, 'Realtime client should authenticate SSE fetch with the stored token.');

console.log('ContractChat live room refresh contract passed.');
