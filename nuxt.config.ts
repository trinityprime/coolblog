// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  telemetry: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      nodeCompat: true,
    },
  },

  css: ["~/assets/css/style.css"],

  app: {
    head: {
      title: "kouvera!",
      htmlAttrs: { lang: "en" },
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      ],
      link: [{ rel: "icon", type: "image/png", href: "/images/favicon.png" }],
    },
  },
});
