import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./workflowFormatters.ts", import.meta.url), "utf8");

assert.match(
  source,
  /function isBareAttachmentReference/,
  "workflowFormatters should identify bare filename references from progress feeds."
);

assert.ok(
  source.includes("resolvedNames.has(name)"),
  "collectAttachments should drop bare filename duplicates when a resolved upload URL already exists."
);

assert.ok(
  source.includes("href && !bareReference ? `href:${href}`"),
  "collectAttachments should continue deduping exact resolved upload URLs."
);
