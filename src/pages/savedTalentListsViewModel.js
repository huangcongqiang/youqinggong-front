export function resolveSavedTalentListsState(payload, preferredListId = '') {
  const lists = Array.isArray(payload?.lists) ? payload.lists : [];
  const activeList = lists.find((item) => String(item?.listId || '') === String(preferredListId || '')) || lists[0] || null;
  const savedTalentIds = [...new Set(lists.flatMap((item) =>
    (Array.isArray(item?.items) ? item.items : []).map((entry) => String(entry?.talentUserId || '')).filter(Boolean)
  ))];

  return {
    lists,
    activeListId: String(activeList?.listId || ''),
    activeList,
    savedTalentIds,
    totalLists: Number(payload?.summary?.totalLists || lists.length || 0),
    totalSavedTalents: Number(payload?.summary?.totalSavedTalents || savedTalentIds.length || 0)
  };
}

export function isTalentSavedInList(list, talentUserId) {
  const target = String(talentUserId || '').trim();
  if (!target) {
    return false;
  }
  return (Array.isArray(list?.items) ? list.items : []).some((item) => String(item?.talentUserId || '').trim() === target);
}

export function buildSavedTalentSummary(state) {
  if (!state?.totalLists) {
    return {
      badge: '0 lists',
      note: 'Create the first list, then save shortlist candidates into it.'
    };
  }

  return {
    badge: `${state.totalLists} lists / ${state.totalSavedTalents} talents`,
    note: state.activeList
      ? `Active list: ${state.activeList.name}. Saved talents: ${state.activeList.itemCount || 0}.`
      : 'Choose a list first, then continue saving shortlist candidates.'
  };
}
