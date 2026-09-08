import { existsSync } from "fs";
import { join } from "path";

const args = process.argv.slice(2);
const verbose = args.includes("-v") || args.includes("--verbose");
const positional = args.filter((a) => !a.startsWith("-"));
const slug = positional[0];
const inputName = positional[1];

if (!slug) {
  console.error("Usage: npm run debug <slug> [input-name] [-v]");
  console.error("Examples:");
  console.error("  npm run debug fulfilled-orders-before-failure");
  console.error("  npm run debug fulfilled-orders-before-failure empty");
  console.error("  npm run debug fulfilled-orders-before-failure empty -v");
  process.exit(1);
}

const challengeFile = join(process.cwd(), "src", "challenges", slug, "index.ts");
const algorithmFile = join(process.cwd(), "src", "challenges", slug, "algorithm.ts");
const debugInputsFile = join(process.cwd(), "src", "challenges", slug, "debug-inputs.ts");

if (!existsSync(challengeFile)) {
  console.error(`Challenge "${slug}" not found.`);
  console.error(`  expected: ${challengeFile}`);
  console.error("  create it with: npm run new <slug>");
  process.exit(1);
}

const pascal = slug
  .split("-")
  .map((s) => s[0].toUpperCase() + s.slice(1))
  .join("");

const algoMod = await import(algorithmFile);
const Algorithm = algoMod[pascal];
if (!Algorithm) {
  console.error(`Challenge "${slug}" has no class named ${pascal} in algorithm.ts.`);
  process.exit(1);
}

let inputs: Record<string, unknown>;
if (existsSync(debugInputsFile)) {
  const customMod = await import(debugInputsFile);
  inputs = customMod.customInputs ?? customMod.inputs;
  if (!inputs || typeof inputs !== "object") {
    console.error(`debug-inputs.ts must export "customInputs" (or "inputs") as a record.`);
    process.exit(1);
  }
} else {
  inputs = {};
}

if (!inputName) {
  console.log(`▸ ${slug} — available inputs:`);
  for (const name of Object.keys(inputs)) {
    console.log(`   ${name}`);
  }
  console.log("");
  console.log(`Run with: npm run debug ${slug} <input-name>`);
  console.log(`Add custom inputs at: src/challenges/${slug}/debug-inputs.ts`);
  process.exit(0);
}

const input = (inputs[inputName] as { input: unknown }).input;
if (input === undefined) {
  console.error(`Input "${inputName}" not found. Available: ${Object.keys(inputs).join(", ")}`);
  process.exit(1);
}

const algo = new Algorithm(input);
const result = algo.run();
const trace = algo.getTrace();

console.log(`\n${slug} › ${inputName}`);

console.log(`\ninput:`);
console.log(JSON.stringify(input, null, 2));

if (result !== undefined) {
  console.log(`\nreturn:`);
  console.log(JSON.stringify(result, null, 2));
}

console.log(`\n${trace.snapshots.length} snapshots:\n`);
for (const [i, snap] of trace.snapshots.entries()) {
  const label = snap.label ?? "(no label)";
  console.log(`[${String(i).padStart(2, "0")}] ${label}`);
  if (verbose) {
    console.log(JSON.stringify(snap.state, null, 2));
  }
}

if (!verbose) {
  console.log("\n(add -v to print the full state at every step)");
}
