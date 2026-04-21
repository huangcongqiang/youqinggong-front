import { computed, ref } from 'vue';
import {
  createSavedTalentList,
  getSavedTalentLists,
  removeTalentFromList,
  saveTalentToList
} from '../services/api';
import {
  buildSavedTalentSummary,
  isTalentSavedInList,
  resolveSavedTalentListsState
} from './savedTalentListsViewModel.js';

export function useSavedTalentLists() {
  const payload = ref(null);
  const activeListId = ref('');
  const draftListName = ref('');
  const feedback = ref('');
  const loading = ref(false);
  const creating = ref(false);
  const mutatingTalentId = ref('');

  const state = computed(() => resolveSavedTalentListsState(payload.value, activeListId.value));
  const summary = computed(() => buildSavedTalentSummary(state.value));
  const activeList = computed(() => state.value.activeList);

  async function loadSavedTalentLists() {
    loading.value = true;
    try {
      const nextPayload = await getSavedTalentLists();
      payload.value = nextPayload;
      const nextState = resolveSavedTalentListsState(nextPayload, activeListId.value);
      activeListId.value = nextState.activeListId;
      if (nextPayload?.requestError) {
        feedback.value = nextPayload.requestError;
      }
      return nextPayload;
    } finally {
      loading.value = false;
    }
  }

  async function createList(name = draftListName.value) {
    const normalizedName = String(name || '').trim();
    if (!normalizedName) {
      feedback.value = 'Create a list first, then save shortlist talent into it.';
      return null;
    }
    creating.value = true;
    try {
      const result = await createSavedTalentList(normalizedName);
      if (result?.requestError || !result?.list?.listId) {
        feedback.value = result?.requestError || 'This list cannot be created right now. Try again in a moment.';
        return null;
      }
      draftListName.value = '';
      activeListId.value = result.list.listId;
      feedback.value = `${result.list.name} was created.`;
      await loadSavedTalentLists();
      return result.list;
    } finally {
      creating.value = false;
    }
  }

  function selectList(listId) {
    activeListId.value = String(listId || '');
    const nextState = resolveSavedTalentListsState(payload.value, activeListId.value);
    if (nextState.activeList?.name) {
      feedback.value = `Switched to ${nextState.activeList.name}.`;
    }
  }

  function isSavedInActiveList(talentUserId) {
    return isTalentSavedInList(activeList.value, talentUserId);
  }

  function isSavedAnywhere(talentUserId) {
    const target = String(talentUserId || '').trim();
    return target ? state.value.savedTalentIds.includes(target) : false;
  }

  async function toggleTalent(talent) {
    const talentUserId = String(talent?.talentUserId || talent?.platformUserId || '').trim();
    if (!talentUserId) {
      feedback.value = 'This talent record is not ready to save yet.';
      return null;
    }

    let targetList = activeList.value;
    if (!targetList) {
      targetList = await createList();
      if (!targetList) {
        return null;
      }
    }

    mutatingTalentId.value = talentUserId;
    try {
      const result = isTalentSavedInList(targetList, talentUserId)
        ? await removeTalentFromList(targetList.listId, talentUserId)
        : await saveTalentToList(targetList.listId, talentUserId);

      if (result?.requestError) {
        feedback.value = result.requestError;
        return result;
      }

      feedback.value = isTalentSavedInList(targetList, talentUserId)
        ? `${talent?.name || 'This talent'} was removed from ${targetList.name}.`
        : `${talent?.name || 'This talent'} was saved to ${targetList.name}.`;
      await loadSavedTalentLists();
      return result;
    } finally {
      mutatingTalentId.value = '';
    }
  }

  return {
    activeList,
    activeListId,
    creating,
    draftListName,
    feedback,
    loading,
    mutatingTalentId,
    state,
    summary,
    createList,
    isSavedAnywhere,
    isSavedInActiveList,
    loadSavedTalentLists,
    selectList,
    toggleTalent
  };
}
