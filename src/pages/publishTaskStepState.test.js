import assert from 'assert'

import {
  clampEditorStepIndex,
  derivePublishTaskReviewMode,
  getOutlineActiveStep,
  getReviewReturnStepIndex,
  resolvePublishTaskStepTransition,
} from './publishTaskStepState.js'

function run(name, assertion) {
  assertion()
  console.log(`ok - ${name}`)
}

run('clampEditorStepIndex removes invalid optional editor step memory', () => {
  assert.equal(clampEditorStepIndex(3, 2), 2)
  assert.equal(clampEditorStepIndex(1, 2), 1)
})

run('required edits keeps outline target highlighted while draft review clears it', () => {
  assert.equal(
    getOutlineActiveStep({
      surfaceMode: 'review',
      reviewMode: derivePublishTaskReviewMode(false),
      editorStepIndex: 2,
      requiredEditStepIndex: 1,
    }),
    1
  )
  assert.equal(
    getOutlineActiveStep({
      surfaceMode: 'review',
      reviewMode: derivePublishTaskReviewMode(true),
      editorStepIndex: 2,
      requiredEditStepIndex: 1,
    }),
    null
  )
})

run('return from review uses required target for required edits and resume step for draft review', () => {
  assert.equal(
    getReviewReturnStepIndex({
      reviewMode: 'required-edits',
      requiredEditStepIndex: 0,
      resumeEditorStepIndex: 2,
    }),
    0
  )
  assert.equal(
    getReviewReturnStepIndex({
      reviewMode: 'draft-review',
      requiredEditStepIndex: 0,
      resumeEditorStepIndex: 2,
    }),
    2
  )
})

run('next transition routes back to earlier required edits before continuing', () => {
  assert.deepEqual(
    resolvePublishTaskStepTransition({
      action: 'next',
      surfaceMode: 'editor',
      editorStepIndex: 2,
      reviewMode: 'required-edits',
      requiredEditStepIndex: 0,
      resumeEditorStepIndex: 2,
      maxEditorStepIndex: 2,
      shouldSkipOptionalSection: false,
      reviewStepIndex: 4,
    }),
    {
      surfaceMode: 'editor',
      editorStepIndex: 0,
      currentStepIndex: 0,
    }
  )
})

run('return from review clamps invalid optional section after optional content is removed', () => {
  assert.deepEqual(
    resolvePublishTaskStepTransition({
      action: 'return-from-review',
      surfaceMode: 'review',
      editorStepIndex: 3,
      reviewMode: 'draft-review',
      requiredEditStepIndex: 0,
      resumeEditorStepIndex: 3,
      maxEditorStepIndex: 2,
      shouldSkipOptionalSection: false,
      reviewStepIndex: 4,
    }),
    {
      surfaceMode: 'editor',
      editorStepIndex: 2,
      currentStepIndex: 2,
    }
  )
})
