# TypeScript + React + Astro

The stack is TypeScript for the algorithm code (catches data-structure bugs, which is where the complexity lives), React for the per-challenge scene components, and Astro for the site structure (one route per challenge, content collections for the index).

Considered: vanilla JS + SVG (no framework, but each scene re-implements plumbing); Svelte + Vite + TS (lighter than React, but smaller ecosystem of viz helpers); Next.js (heavier, opinionated SSR we don't need).