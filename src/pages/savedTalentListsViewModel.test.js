import {
  buildSavedTalentSummary,
  isTalentSavedInList,
  resolveSavedTalentListsState
} from './savedTalentListsViewModel.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const payload = {
  summary: {
    totalLists: 2,
    totalSavedTalents: 2
  },
  lists: [
    {
      listId: 'saved-list-002',
      name: 'Fast response',
      itemCount: 1,
      items: [{ talentUserId: '12', name: '林昭' }]
    },
    {
      listId: 'saved-list-001',
      name: 'Packaging shortlist',
      itemCount: 1,
      items: [{ talentUserId: '11', name: '陈一宁' }]
    }
  ]
};

const resolved = resolveSavedTalentListsState(payload, 'saved-list-001');
assert(resolved.activeListId === 'saved-list-001', 'resolveSavedTalentListsState should honor the preferred list id when it exists.');
assert(resolved.savedTalentIds.length === 2, 'resolveSavedTalentListsState should collect all saved talent ids across lists.');
assert(isTalentSavedInList(resolved.activeList, '11'), 'isTalentSavedInList should detect talents already saved in the active list.');

const summary = buildSavedTalentSummary(resolved);
assert(summary.badge === '2 lists / 2 talents', 'buildSavedTalentSummary should expose total list and saved talent counts.');
assert(summary.note.includes('Packaging shortlist'), 'buildSavedTalentSummary should mention the active list name when available.');
