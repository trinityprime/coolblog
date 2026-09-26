# kouvera! (Nuxt 4)

This is a Nuxt conversion of the original static HTML/CSS site.

## Structure

- `app/pages/index.vue` — home page
- `app/pages/credits.vue` — credits page
- `app/layouts/default.vue` — shared background, header, sidebar, footer
- `app/components/SiteHeader.vue` — the "KOUVERA!" jump-text logo (desktop + mobile variants)
- `app/components/SiteSidebar.vue` — sidebar: socials, nav, hamburger menu (reactive, not DOM-manipulated)
- `app/components/LiveClock.vue` — Singapore-time clock (was inline in script.js)
- `app/components/PatchNotes.vue` — patch notes list (was a hardcoded array in script.js)
- `app/assets/css/style.css` — original stylesheet, with font/image paths updated to `/fonts` and `/images`
- `public/fonts`, `public/images` — static assets, served as-is

## Notes on the conversion

- The old `base.js` (GitHub Pages base-href hack) and manual DOM manipulation in `script.js`
  were replaced with Nuxt routing (`NuxtLink`, `NuxtPage`) and Vue reactivity (`ref`, `onMounted`).
- Two image filenames with spaces (`haru urara.jpg`, `osu banner.jpeg`) were renamed to
  `haru-urara.jpg` / `osu-banner.jpeg` for safer URLs.
- A couple of dead/broken CSS rules from the original (an empty `url("../images/")` and a
  `--accent-light` variable that was never defined) were fixed/removed.

## Usage

```bash
npm install
npm run dev        # local dev server
npm run generate   # static site (equivalent to the original GitHub Pages deploy)
npm run build      # SSR/Node build
```
