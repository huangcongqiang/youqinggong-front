export function clampEditorStepIndex(stepIndex, maxEditorStepIndex) {
  const normalizedStepIndex = Number.isFinite(stepIndex) ? stepIndex : 0
  const normalizedMaxEditorStepIndex = Number.isFinite(maxEditorStepIndex) ? maxEditorStepIndex : 0
  return Math.max(0, Math.min(normalizedStepIndex, normalizedMaxEditorStepIndex))
}

export function derivePublishTaskReviewMode(canPublishDraft) {
  return canPublishDraft ? 'draft-review' : 'required-edits'
}

export function getCurrentPublishTaskStepIndex({ surfaceMode, editorStepIndex, reviewStepIndex }) {
  return surfaceMode === 'review' ? reviewStepIndex : editorStepIndex
}

export function getResumeEditorStepIndex(lastEditorStep, maxEditorStepIndex) {
  return clampEditorStepIndex(lastEditorStep, maxEditorStepIndex)
}

export function getRequiredEditStepIndex(firstIncompleteRequiredStepIndex, resumeEditorStepIndex) {
  return typeof firstIncompleteRequiredStepIndex === 'number'
    ? firstIncompleteRequiredStepIndex
    : resumeEditorStepIndex
}

export function getReviewReturnStepIndex({ reviewMode, requiredEditStepIndex, resumeEditorStepIndex }) {
  return reviewMode === 'draft-review' ? resumeEditorStepIndex : requiredEditStepIndex
}

export function getOutlineActiveStep({ surfaceMode, reviewMode, editorStepIndex, requiredEditStepIndex }) {
  if (surfaceMode === 'review') {
    return reviewMode === 'required-edits' ? requiredEditStepIndex : null
  }
  return editorStepIndex
}

export function resolvePublishTaskStepTransition({
  action,
  surfaceMode,
  editorStepIndex,
  reviewMode,
  requiredEditStepIndex,
  resumeEditorStepIndex,
  maxEditorStepIndex,
  shouldSkipOptionalSection,
  reviewStepIndex,
  requestedIndex,
}) {
  const clampedEditorStepIndex = clampEditorStepIndex(editorStepIndex, maxEditorStepIndex)
  const clampedRequiredEditStepIndex = clampEditorStepIndex(requiredEditStepIndex, maxEditorStepIndex)
  const clampedResumeEditorStepIndex = clampEditorStepIndex(resumeEditorStepIndex, maxEditorStepIndex)
  const reviewReturnStepIndex = getReviewReturnStepIndex({
    reviewMode,
    requiredEditStepIndex: clampedRequiredEditStepIndex,
    resumeEditorStepIndex: clampedResumeEditorStepIndex,
  })

  if (action === 'open-review') {
    return {
      surfaceMode: 'review',
      editorStepIndex: clampedEditorStepIndex,
      currentStepIndex: reviewStepIndex,
    }
  }

  if (action === 'open-required-edits') {
    return {
      surfaceMode: 'editor',
      editorStepIndex: clampedRequiredEditStepIndex,
      currentStepIndex: clampedRequiredEditStepIndex,
    }
  }

  if (action === 'return-from-review') {
    return {
      surfaceMode: 'editor',
      editorStepIndex: reviewReturnStepIndex,
      currentStepIndex: reviewReturnStepIndex,
    }
  }

  if (action === 'jump') {
    const nextIndex = Math.max(0, Math.min(requestedIndex ?? clampedEditorStepIndex, reviewStepIndex))
    if (nextIndex >= reviewStepIndex) {
      return {
        surfaceMode: 'review',
        editorStepIndex: clampedEditorStepIndex,
        currentStepIndex: reviewStepIndex,
      }
    }
    const clampedRequestedEditorStepIndex = clampEditorStepIndex(nextIndex, maxEditorStepIndex)
    return {
      surfaceMode: 'editor',
      editorStepIndex: clampedRequestedEditorStepIndex,
      currentStepIndex: clampedRequestedEditorStepIndex,
    }
  }

  if (action === 'previous') {
    if (surfaceMode === 'review') {
      return {
        surfaceMode: 'editor',
        editorStepIndex: reviewReturnStepIndex,
        currentStepIndex: reviewReturnStepIndex,
      }
    }
    const previousEditorStepIndex = clampEditorStepIndex(clampedEditorStepIndex - 1, maxEditorStepIndex)
    return {
      surfaceMode: 'editor',
      editorStepIndex: previousEditorStepIndex,
      currentStepIndex: previousEditorStepIndex,
    }
  }

  if (action === 'next') {
    if (reviewMode === 'draft-review') {
      return {
        surfaceMode: 'review',
        editorStepIndex: clampedEditorStepIndex,
        currentStepIndex: reviewStepIndex,
      }
    }
    if (clampedRequiredEditStepIndex < clampedEditorStepIndex) {
      return {
        surfaceMode: 'editor',
        editorStepIndex: clampedRequiredEditStepIndex,
        currentStepIndex: clampedRequiredEditStepIndex,
      }
    }
    if (shouldSkipOptionalSection || clampedEditorStepIndex >= maxEditorStepIndex) {
      return {
        surfaceMode: 'review',
        editorStepIndex: clampedEditorStepIndex,
        currentStepIndex: reviewStepIndex,
      }
    }
    const nextEditorStepIndex = clampEditorStepIndex(clampedEditorStepIndex + 1, maxEditorStepIndex)
    return {
      surfaceMode: 'editor',
      editorStepIndex: nextEditorStepIndex,
      currentStepIndex: nextEditorStepIndex,
    }
  }

  return {
    surfaceMode: surfaceMode === 'review' ? 'review' : 'editor',
    editorStepIndex: clampedEditorStepIndex,
    currentStepIndex: surfaceMode === 'review' ? reviewStepIndex : clampedEditorStepIndex,
  }
}
