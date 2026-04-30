import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const currentDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(currentDir, 'ContractChat.tsx'), 'utf8');

assert.match(
  source,
  /function imageSrcOf/,
  'ContractChat should normalize avatar image sources before passing them to AvatarImage.',
);
assert.ok(
  source.includes("return /^(https?:\\/\\/|data:image\\/|blob:|\\/)/i.test(src) ? src : '';"),
  'Avatar image sources should only allow absolute, data, blob, or root-relative URLs.',
);
assert.match(
  source,
  /ownAvatarSrc\s*\?\s*<AvatarImage src=\{ownAvatarSrc\}/,
  'ContractChat should not pass name initials or undefined strings as AvatarImage src.',
);
assert.doesNotMatch(
  source,
  /<AvatarImage src=\{currentUser\?\.avatar\}/,
  'ContractChat should not render the raw currentUser.avatar as an image URL.',
);

console.log('ContractChat avatar URL guard contract passed.');
