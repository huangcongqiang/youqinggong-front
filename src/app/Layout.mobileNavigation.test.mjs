import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const layoutSource = readFileSync(resolve(currentDir, 'Layout.tsx'), 'utf8');
const themeSource = readFileSync(resolve(currentDir, '../styles/theme.css'), 'utf8');

assert(
  layoutSource.includes('const mobilePrimaryMenu = menu.slice(0, 4)')
    && layoutSource.includes('const mobileMoreMenu = menu.slice(4)')
    && layoutSource.includes('setIsMobileMoreOpen((open) => !open)')
    && layoutSource.includes('更多功能')
    && layoutSource.includes('账单管理')
    && layoutSource.includes('发票管理'),
  'AuthLayout mobile navigation should expose secondary PC routes through a More panel.'
);

assert(
  layoutSource.includes('data-app-shell-content')
    && layoutSource.includes('data-mobile-bottom-nav')
    && themeSource.includes('[data-app-shell-content]')
    && themeSource.includes('@media (max-width: 767px)')
    && themeSource.includes('padding-bottom: calc(5rem + env(safe-area-inset-bottom))')
    && themeSource.includes('overflow-x: hidden'),
  'Responsive app shell should provide mobile overflow safeguards for PC pages.'
);
