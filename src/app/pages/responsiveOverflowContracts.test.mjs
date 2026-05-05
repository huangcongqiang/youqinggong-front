import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const homeSource = readFileSync(resolve(currentDir, 'Home.tsx'), 'utf8');
const talentSearchSource = readFileSync(resolve(currentDir, 'TalentSearch.tsx'), 'utf8');
const talentOnboardingSource = readFileSync(resolve(currentDir, 'TalentOnboarding.tsx'), 'utf8');
const enterpriseRecruitingSource = readFileSync(resolve(currentDir, 'EnterpriseRecruiting.tsx'), 'utf8');

assert(
  homeSource.includes('px-4 sm:px-8')
    && homeSource.includes('space-x-3 sm:space-x-6')
    && homeSource.includes('className="hidden sm:block"')
    && homeSource.includes('data-home-register-link')
    && homeSource.includes('data-home-hero-title')
    && homeSource.includes('box-border w-full max-w-full pt-32 pb-20')
    && homeSource.includes('w-full min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-full')
    && homeSource.includes('text-3xl sm:text-5xl md:text-7xl')
    && homeSource.includes('w-full min-w-0 text-base sm:text-lg')
    && homeSource.includes('max-w-[calc(100vw-2rem)] sm:max-w-2xl')
    && homeSource.includes('max-w-[calc(100vw-2rem)] sm:max-w-md')
    && homeSource.includes('data-home-hero-fit')
    && homeSource.includes('data-home-hero-actions')
    && homeSource.includes('w-full py-24 bg-slate-50 border-t border-slate-100 overflow-hidden')
    && homeSource.includes('text-2xl sm:text-3xl font-bold')
    && homeSource.includes('break-words [overflow-wrap:anywhere]'),
  'Landing page hero and nav should fit 390px mobile without clipping the headline or register action.'
);

const themeSource = readFileSync(resolve(currentDir, '../../styles/theme.css'), 'utf8');

assert(
  themeSource.includes('[data-home-register-link]')
    && themeSource.includes('display: none !important')
    && themeSource.includes('[data-home-hero-title]')
    && themeSource.includes('font-size: 2rem')
    && themeSource.includes('line-height: 1.18')
    && themeSource.includes('align-items: flex-start')
    && themeSource.includes('margin-left: 0'),
  'Landing page mobile CSS should prevent the register CTA and hero headline from overflowing 390px screenshots.'
);

assert(
  talentSearchSource.includes('className="flex flex-wrap gap-2 pb-2"')
    && !talentSearchSource.includes('-right-12 top-6 rotate-45'),
  'Talent marketplace filters and rating badge should stay inside narrow app viewports.'
);

assert(
  talentOnboardingSource.includes('relative grid grid-cols-4 items-start gap-2')
    && talentOnboardingSource.includes('className="flex min-w-0 flex-col items-center text-center"')
    && !talentOnboardingSource.includes('min-w-[520px]'),
  'Talent onboarding stepper should not force horizontal overflow on 390px mobile.'
);

assert(
  enterpriseRecruitingSource.includes('mb-6 flex flex-wrap gap-x-4 gap-y-3 border-b border-slate-200 sm:gap-x-6')
    && !enterpriseRecruitingSource.includes('flex space-x-6 mb-6 border-b border-slate-200 overflow-x-auto'),
  'Enterprise recruiting tabs should wrap on small screens instead of clipping the final status tab.'
);
