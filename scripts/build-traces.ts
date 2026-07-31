import { readdirSync, writeFileSync } from "fs";
import { join } from "path";

const CHALLENGES_DIR = join(process.cwd(), "src", "challenges");

function firstInput(customInputs: Record<string, { input: unknown }>) {
  const first = Object.values(customInputs)[0];
  if (!first) throw new Error(`No customInputs defined for this challenge`);
  return first.input;
}

async function buildAll() {
  const entries = readdirSync(CHALLENGES_DIR, { withFileTypes: true });
  const challenges = entries.filter((e) => e.isDirectory());

  for (const entry of challenges) {
    const challengePath = join(CHALLENGES_DIR, entry.name);
    const algorithmPath = join(challengePath, "algorithm.ts");
    const debugInputsPath = join(challengePath, "debug-inputs.ts");

    try {
      const algoMod = await import(algorithmPath);
      const inputsMod = await import(debugInputsPath);
      const pascal = entry.name
        .split("-")
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join("");
      const Algorithm = algoMod[pascal];
      if (!Algorithm) {
        console.warn(`skip ${entry.name}: no class named ${pascal} in algorithm.ts`);
        continue;
      }
      const customInputs = inputsMod.customInputs;
      if (!customInputs) {
        console.warn(`skip ${entry.name}: no customInputs in debug-inputs.ts`);
        continue;
      }

      const algo = new Algorithm(firstInput(customInputs));
      algo.run();
      const trace = algo.getTrace();

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