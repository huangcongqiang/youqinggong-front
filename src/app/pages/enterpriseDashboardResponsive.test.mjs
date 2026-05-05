import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const dashboardSource = readFileSync(resolve(currentDir, 'EnterpriseDashboard.tsx'), 'utf8');

assert(
  dashboardSource.includes('flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between')
    && dashboardSource.includes('className="min-w-0"')
    && dashboardSource.includes('break-words text-2xl font-bold'),
  'Enterprise dashboard header should stack below desktop width so the greeting is not squeezed into single-character lines.'
);

assert(
  dashboardSource.includes('flex flex-wrap items-center gap-3'),
  'Enterprise dashboard header actions should wrap on narrow screens.'
);
