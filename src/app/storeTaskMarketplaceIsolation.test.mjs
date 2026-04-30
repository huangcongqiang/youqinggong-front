import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const storeSource = readFileSync(resolve(currentDir, 'store.tsx'), 'utf8');

const refreshTasksStart = storeSource.indexOf('const refreshTasks = useCallback(async (query: TaskMarketplaceQuery = {}) => {');
const refreshTasksEnd = storeSource.indexOf('const refreshDashboardData = useCallback(async () => {');
assert(refreshTasksStart > -1 && refreshTasksEnd > refreshTasksStart, 'refreshTasks source block should exist.');

const refreshTasksSource = storeSource.slice(refreshTasksStart, refreshTasksEnd);

assert(
  refreshTasksSource.includes('setIsLoadingData(true);')
    && refreshTasksSource.includes('setTasks([]);')
    && refreshTasksSource.includes('const payload = await getTaskMarketplaceData(query);')
    && refreshTasksSource.includes('} finally {')
    && refreshTasksSource.includes('setIsLoadingData(false);'),
  'refreshTasks should clear stale dashboard tasks and expose loading while marketplace data is being fetched.'
);

assert(
  refreshTasksSource.indexOf('setTasks([]);') < refreshTasksSource.indexOf('const payload = await getTaskMarketplaceData(query);'),
  'refreshTasks should clear stale tasks before awaiting the marketplace request.'
);

const refreshDashboardStart = storeSource.indexOf('const refreshDashboardData = useCallback(async () => {');
const refreshDashboardEnd = storeSource.indexOf('const loginWithPassword = useCallback(');
assert(refreshDashboardStart > -1 && refreshDashboardEnd > refreshDashboardStart, 'refreshDashboardData source block should exist.');

const refreshDashboardSource = storeSource.slice(refreshDashboardStart, refreshDashboardEnd);

assert(
  storeSource.includes('const dataRequestSeq = useRef(0);')
    && refreshTasksSource.includes('const requestId = dataRequestSeq.current + 1;')
    && refreshTasksSource.includes('if (dataRequestSeq.current !== requestId) {')
    && refreshDashboardSource.includes('const requestId = dataRequestSeq.current + 1;')
    && refreshDashboardSource.includes('if (dataRequestSeq.current !== requestId) {'),
  'dashboard and marketplace refreshes should use a shared request sequence so stale dashboard responses cannot overwrite TaskSquare data.'
);
