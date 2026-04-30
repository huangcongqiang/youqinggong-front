import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, '../../..');
const packageJson = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'));

assert.ok(
  packageJson.dependencies?.['@tencentcloud/lite-chat'],
  'Tencent IM primary channel should depend on @tencentcloud/lite-chat.',
);

const apiSource = readFileSync(resolve(currentDir, '../services/api.ts'), 'utf8');

assert.match(
  apiSource,
  /export\s+async\s+function\s+getTencentImConfig/,
  'api.ts should export getTencentImConfig for the Tencent IM credential endpoint.',
);
assert.match(
  apiSource,
  /\/im\/tencent\/config\?roomKey=/,
  'getTencentImConfig should call the backend Tencent IM config endpoint with roomKey.',
);

const imClientSource = readFileSync(resolve(currentDir, '../services/tencentImClient.ts'), 'utf8');

assert.match(imClientSource, /@tencentcloud\/lite-chat/, 'Tencent adapter should import the V4 Lite Chat SDK.');
assert.match(imClientSource, /createTaskImRoomClient/, 'Tencent adapter should expose createTaskImRoomClient.');
assert.match(imClientSource, /sendText/, 'Tencent adapter should expose sendText.');
assert.match(imClientSource, /sendImage/, 'Tencent adapter should expose sendImage.');
assert.match(imClientSource, /sendBusinessFile/, 'Tencent adapter should expose sendBusinessFile.');
assert.match(imClientSource, /sharedChatSession/, 'Tencent adapter should share the SDK singleton across room switches.');
assert.match(imClientSource, /IDLE_LOGOUT_DELAY_MS/, 'Tencent adapter should delay logout so room switches do not degrade the SDK session.');
assert.match(imClientSource, /activeClients/, 'Tencent adapter should track active room clients before idle logout.');
assert.match(imClientSource, /YQG_TASK_FILE/, 'Business file custom messages should use the YQG_TASK_FILE kind.');
assert.match(imClientSource, /mergeOptimisticAttachments/, 'Image messages should merge optimistic file metadata with SDK-returned URLs.');
assert.match(imClientSource, /startAudioCall/, 'Audio call placeholder should exist for later TRTC work.');
assert.match(imClientSource, /startVideoCall/, 'Video call placeholder should exist for later TRTC work.');
assert.match(imClientSource, /onCallInvite/, 'Call invite placeholder should exist for later TRTC work.');

const hookSource = readFileSync(resolve(currentDir, '../services/useTaskImRoom.ts'), 'utf8');

assert.match(hookSource, /getTencentImConfig/, 'useTaskImRoom should load backend Tencent IM config.');
assert.match(hookSource, /createTaskImRoomClient/, 'useTaskImRoom should create the Tencent IM adapter.');
assert.match(hookSource, /degraded/, 'useTaskImRoom should expose degraded mode.');
assert.match(hookSource, /config\.enabled === false/, 'useTaskImRoom should respect backend disabled realtime config.');
assert.match(hookSource, /realtimeDisabledReason/, 'useTaskImRoom should surface backend realtime degrade reason.');
assert.match(hookSource, /sendText/, 'useTaskImRoom should expose sendText.');
assert.match(hookSource, /sendImage/, 'useTaskImRoom should expose sendImage.');
assert.match(hookSource, /sendBusinessFile/, 'useTaskImRoom should expose sendBusinessFile.');
assert.match(hookSource, /refreshFromBusinessStore/, 'useTaskImRoom should expose a business-store refresh placeholder.');

const contractChatSource = readFileSync(resolve(currentDir, 'ContractChat.tsx'), 'utf8');

assert.match(contractChatSource, /useTaskImRoom/, 'ContractChat should use the Tencent IM hook.');
assert.match(contractChatSource, /sendBusinessFile/, 'ContractChat should send uploaded business files through Tencent IM custom messages.');
assert.doesNotMatch(
  contractChatSource,
  /taskImRoom\.sendImage\(file\)/,
  'ContractChat should not call native Lite Chat image upload until its production upload endpoint is configured.',
);
assert.match(
  contractChatSource,
  /Native Lite Chat image upload currently has no production upload endpoint/,
  'ContractChat should document why images are routed through platform-backed attachments.',
);
assert.match(contractChatSource, /IM_DEGRADED|isDegraded|degraded/, 'ContractChat should keep REST/SSE fallback when Tencent IM fails.');
assert.match(contractChatSource, /sendTaskRoomMessage/, 'ContractChat should retain legacy REST sending only for degraded mode.');
assert.match(contractChatSource, /disabled[\s\S]*CALL_NOT_ENABLED/, 'Phone and video buttons should be explicit disabled placeholders.');

console.log('ContractChat Tencent IM contract passed.');
