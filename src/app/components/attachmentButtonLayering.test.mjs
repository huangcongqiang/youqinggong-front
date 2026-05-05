import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(currentDir, "AttachmentButton.tsx"), "utf8");

assert.ok(
  source.includes('import { createPortal } from "react-dom";')
    && source.includes("createPortal(previewDialog, document.body)"),
  "Attachment preview dialog should render through a body portal so task cards cannot create a higher local stacking context."
);

assert.ok(
  source.includes("fixed inset-0 z-[100]"),
  "Attachment preview dialog should sit above ordinary app popovers and task modules."
);

assert.ok(
  source.includes('role="dialog"') && source.includes('aria-modal="true"'),
  "Attachment preview dialog should keep accessible modal semantics after being portaled."
);

console.log("attachmentButtonLayering contracts passed");
