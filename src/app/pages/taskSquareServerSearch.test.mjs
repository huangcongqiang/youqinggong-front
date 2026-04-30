import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const taskSquareSource = readFileSync(resolve(currentDir, 'TaskSquare.tsx'), 'utf8');
const storeSource = readFileSync(resolve(currentDir, '../store.tsx'), 'utf8');
const apiSource = readFileSync(resolve(currentDir, '../services/api.ts'), 'utf8');

assert(
  apiSource.includes('getTaskMarketplaceData(params: { page?: number; size?: number; keyword?: string; category?: string } = {})')
    && apiSource.includes('if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());')
    && apiSource.includes('if (params.category?.trim()) query.set("category", params.category.trim());')
    && apiSource.includes('`/tasks/marketplace${suffix ? `?${suffix}` : ""}`'),
  'Task marketplace API client should support server-side keyword search and category ranking.'
);

assert(
  storeSource.includes('interface TaskMarketplaceQuery')
    && storeSource.includes('refreshTasks: (query?: TaskMarketplaceQuery) => Promise<void>;')
    && storeSource.includes('const refreshTasks = useCallback(async (query: TaskMarketplaceQuery = {}) => {')
    && storeSource.includes('const payload = await getTaskMarketplaceData(query);'),
  'Store refreshTasks should pass task search query parameters to the marketplace API.'
);

assert(
  taskSquareSource.includes('const taskSearchKeyword = searchQuery.trim();')
    && taskSquareSource.includes("const taskCategoryPreference = activeCategory === '全部' ? '' : activeCategory;")
    && taskSquareSource.includes('refreshTasks({ keyword: taskSearchKeyword, category: taskCategoryPreference, size: 60 });')
    && taskSquareSource.includes('[refreshTasks, taskSearchKeyword, taskCategoryPreference]')
    && !taskSquareSource.includes("const categoryMatched = activeCategory === '全部'")
    && taskSquareSource.includes('按匹配度排序'),
  'TaskSquare should refresh marketplace data from the server, request the backend max page size, and use category as ranking preference instead of hiding low-match tasks.'
);
