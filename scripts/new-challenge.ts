import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run new <slug>");
  console.error("Example: npm run new binary-search");
  process.exit(1);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(`Invalid slug "${slug}". Use kebab-case (e.g. binary-search).`);
  process.exit(1);
}

const dir = join(process.cwd(), "src", "challenges", slug);
if (existsSync(dir)) {
  console.error(`Already exists: ${dir}`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });

const pascal = slug
  .split("-")
  .map((s) => s[0].toUpperCase() + s.slice(1))
  .join("");

const Title = pascal
  .replace(/([a-z])([A-Z])/g, "$1 $2")
  .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

const algorithm = `import { TracedAlgorithm } from "@framework";

export interface ${pascal}Input {
  // TODO: define the input shape
}

export interface ${pascal}State {
  // TODO: define the state shape.
  // Tip: give each element a stable id if you need it to animate
  // (e.g. { id: number; value: number }[] instead of plain number[]).
}

export class ${pascal} extends TracedAlgorithm<${pascal}Input, ${pascal}State> {
  protected initialState(input: ${pascal}Input): ${pascal}State {
    // TODO: build the starting state from the input
    return {} as ${pascal}State;
  }

  run(): void {
    // TODO: implement the algorithm.
    // Call this.snapshot("label") at every interesting moment.
  }
}
`;

const scene = `import type { Snapshot } from "@framework";
import type { ${pascal}State } from "./algorithm";

export function ${pascal}Scene({ snapshot }: { snapshot: Snapshot<${pascal}State> }) {
  // TODO: render the state. Read snapshot.state and return JSX.
  // While developing, this dump is useful:
  return (
    <div className="scene" style={{ padding: "1rem", fontFamily: "monospace" }}>
      <pre>{JSON.stringify(snapshot.state, null, 2)}</pre>
    </div>
  );
}
`;

const examples = `import type { Example } from "@framework";
import type { ${pascal}Input } from "./algorithm";

export const examples: Example<${pascal}Input>[] = [
  {
    name: "small",
    description: "TODO: describe this example",
    input: {
      // TODO: provide input data
    } as ${pascal}Input,
  },
];
`;

const index = `import { runAndTrace } from "@framework";
import type { Challenge, Trace } from "@framework";
import { ${pascal}, type ${pascal}Input, type ${pascal}State } from "./algorithm";
import { ${pascal}Scene } from "./scene";
import { examples } from "./examples";

export const challenge: Challenge<${pascal}Input, ${pascal}State> = {
  meta: {
    slug: "${slug}",
    title: "${Title}",
    description: "TODO: describe this challenge in one sentence.",
  },
  examples,
  Algorithm: ${pascal},
  Scene: ${pascal}Scene,
};

export function runDefault(): Trace<${pascal}State> {
  return runAndTrace(${pascal}, examples[0].input);
}

export { ${pascal}, ${pascal}Scene, examples };
export type { ${pascal}Input, ${pascal}State };
`;

const debugInputs = `import type { ${pascal}Input } from "./algorithm";

export const customInputs: Record<string, ${pascal}Input> = {
  // TODO: add your test inputs here, e.g.
  //   empty: { /* ... */ } as ${pascal}Input,
  //   small: { /* ... */ } as ${pascal}Input,
};
`;

writeFileSync(join(dir, "algorithm.ts"), algorithm);
writeFileSync(join(dir, "scene.tsx"), scene);
writeFileSync(join(dir, "examples.ts"), examples);
writeFileSync(join(dir, "index.ts"), index);
writeFileSync(join(dir, "debug-inputs.ts"), debugInputs);

console.log(`✓ Created src/challenges/${slug}/`);
console.log("");
console.log("Next steps:");
console.log(`  1. Edit algorithm.ts — define Input/State, implement run()`);
console.log(`  2. Edit debug-inputs.ts — add test inputs (npm run debug ${slug})`);
console.log(`  3. Edit examples.ts — pick 2–4 for the challenge page`);
console.log(`  4. Edit index.ts — change title and description`);
console.log(`  5. Run: npm run build:traces`);
console.log(`  6. Run: npm run dev  (visit /challenges/${slug}/)`);
console.log(`  7. Then come back for help with the visualization`);
