// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import favicons from "astro-favicons";
import mkcert from'vite-plugin-mkcert'

import cloudflare from "@astrojs/cloudflare";

const isDev = process.argv.includes("dev");

export default defineConfig({
  vite: {
    // mkcert is only needed locally for HTTPS dev; keeping it out of CI build avoids Pages build issues.
    // @ts-ignore
    plugins: isDev ? [tailwindcss(), mkcert()] : [tailwindcss()],
  },

  site: "https://garpunkal.dev",
  prefetch: true,

  image: {
    domains: ["res.cloudinary.com", "cloud.squidex.io"],
  },

  integrations: [
    sitemap(),
    robotsTxt({
      sitemap: ["https://garpunkal.dev/sitemap-index.xml"],
    }),
    favicons({
      input: "public/favicon.png",
      name: "garpunkal.dev",
      short_name: "garpunkal",
      icons: {
        favicons: true,
        android: false,
        appleIcon: false,
        appleStartup: false,
        windows: false,
        yandex: false,
      },
      pixel_art: true,
      manifestMaskable: false,
      output: {
        images: true,
        files: true,
        html: false,
      },
      background: "#077da0",
    }),
  ],

  adapter: cloudflare()
});