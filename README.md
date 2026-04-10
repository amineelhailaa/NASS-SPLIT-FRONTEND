# FRONT-END

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Comments

- **2026-04-08** — Avatar upload in `SignUpView.vue`: the visible "Upload photo" button calls `fileInput.value.click()` to programmatically trigger the hidden `<input type="file">`. On file select, `URL.createObjectURL(file)` generates a temporary blob URL stored in `avatarPreview`, which the preview `<img>` binds to via `v-if`.
- **2026-04-10** — Auth best practice for Vue SPA with Sanctum: persist user to `localStorage` on login, hydrate `ref` from it on store init (zero requests on reload), keep router guard synchronous, and handle session expiry globally via an axios 401 interceptor that clears localStorage and redirects to login.
