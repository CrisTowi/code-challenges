import type { Challenge } from "@framework";

type Module = {
  challenge: Challenge<unknown, unknown, void>;
  runDefault: () => { snapshots: Array<{ state: unknown; label?: string }> };
};

const modules = import.meta.glob<Module>("../challenges/*/index.ts", { eager: true });
const traces = import.meta.glob<{ snapshots: Array<{ state: unknown; label?: string }> }>(
  "../challenges/*/trace.json",
  { eager: true, import: "default" },
);

export const challenges = Object.entries(modules)
  .map(([path, mod]) => {
    const slug = path.split("/").at(-2)!;
    const tracePath = path.replace("/index.ts", "/trace.json");
    const trace = traces[tracePath] ?? { snapshots: [] };
    return {
      slug,
      title: mod.challenge.meta.title,
      description: mod.challenge.meta.description,
      trace,
    };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

export function findChallenge(slug: string) {
  return challenges.find((c) => c.slug === slug);
}
