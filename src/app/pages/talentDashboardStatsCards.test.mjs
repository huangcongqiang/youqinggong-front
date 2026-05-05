import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const talentDashboardSource = readFileSync(resolve(currentDir, "TalentDashboard.tsx"), "utf8");
const statsCardsSection = talentDashboardSource.slice(
  talentDashboardSource.indexOf("{/* Stats Cards */}"),
  talentDashboardSource.indexOf("{/* Main Content Area */}")
);

const equalHeightContentClass = "flex h-full min-h-[168px] flex-col justify-between p-6";
const equalHeightContentCount = statsCardsSection.split(equalHeightContentClass).length - 1;
const fullHeightCardCount = statsCardsSection.split('Card className="h-full border-none shadow-sm').length - 1;
const fullHeightWrapperCount = statsCardsSection.split('variants={itemVars} className="h-full"').length - 1;

assert.ok(
  statsCardsSection.length > 0,
  "Talent dashboard should keep a clearly marked stats cards section for layout contracts."
);

assert.equal(
  equalHeightContentCount,
  3,
  "Talent dashboard top stats cards should use the same minimum-height flex content layout."
);

assert.equal(
  fullHeightCardCount,
  3,
  "Talent dashboard top stats cards should stretch each card to the same grid-row height."
);

assert.equal(
  fullHeightWrapperCount,
  3,
  "Talent dashboard top stats card wrappers should stretch so the cards can fill the row."
);

console.log("talentDashboardStatsCards contracts passed");
