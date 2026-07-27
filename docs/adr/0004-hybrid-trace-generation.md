# Build-time trace + client-side regen

The trace is generated at build time: `astro build` runs each algorithm with its default example and writes a `trace.json` next to it. The page ships with the baked trace as the default. A "regenerate" button on the page re-runs the algorithm in the browser with a chosen example, producing a fresh trace on the fly.

Pure build-time is fast but discourages exploration. Pure runtime lets any input be tried, but the first frame is delayed by algorithm execution. The hybrid gives a fast default and optional interactivity — the page is usable without JS, and progressively enhances when the user clicks regenerate.