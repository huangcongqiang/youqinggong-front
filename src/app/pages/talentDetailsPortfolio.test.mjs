import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(currentDir, "TalentDetails.tsx"), "utf8");

assert(
  source.includes("isPortfolioImage")
    && source.includes("<img")
    && source.includes("src={portfolioUrl(item)}")
    && source.includes("object-cover"),
  "TalentDetails should render image portfolio items as visible image thumbnails."
);

assert(
  source.includes("selectedPortfolioImage")
    && source.includes('role="dialog"')
    && source.includes('aria-modal="true"')
    && source.includes("查看大图")
    && source.includes("setSelectedPortfolioImage(item)"),
  "TalentDetails should open an accessible large-image preview when an image portfolio item is clicked."
);

assert(
  source.includes("onKeyDown")
    && source.includes("Escape")
    && source.includes("关闭预览"),
  "TalentDetails large-image preview should support keyboard and button close interactions."
);
