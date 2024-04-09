import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { config } from "dotenv";
import react from "@astrojs/react";

config();

// https://astro.build/config
export default defineConfig({
  site: "https://cwv-dash.vercel.app",
  integrations: [tailwind(), mdx(), sitemap(), react()],
});
