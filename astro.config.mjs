import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const REPO_NAME = "code-challenges";

export default defineConfig({
  site: `https://cristowi.github.io/${REPO_NAME}`,
  base: `/${REPO_NAME}/`,
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        "@framework": "/src/framework",
        "@challenges": "/challenges",
      },
    },
  },
});
