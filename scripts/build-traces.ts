import { readdirSync, writeFileSync } from "fs";
import { join } from "path";

const CHALLENGES_DIR = join(process.cwd(), "src", "challenges");

async function buildAll() {
  const entries = readdirSync(CHALLENGES_DIR, { withFileTypes: true });
  const challenges = entries.filter((e) => e.isDirectory());

  for (const entry of challenges) {
    const challengePath = join(CHALLENGES_DIR, entry.name);
    const indexPath = join(challengePath, "index.ts");

    try {
      const mod = await import(indexPath);
      if (typeof mod.runDefault !== "function") {
        console.warn(`skip ${entry.name}: no runDefault export`);
        continue;
      }
      const trace = mod.runDefault();
      const tracePath = join(challengePath, "trace.json");
      writeFileSync(tracePath, JSON.stringify(trace, null, 2));
      console.log(`✓ ${entry.name}: ${trace.snapshots.length} snapshots written`);
    } catch (err) {
      console.error(`✗ ${entry.name}:`, err);
      process.exitCode = 1;
    }
  }
}

buildAll();
