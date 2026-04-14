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
- **2026-04-12** — `scrollTop` and `scrollHeight` are plain DOM properties. Setting `el.scrollTop = el.scrollHeight` scrolls a div to its bottom — e.g. a 300px-tall div with 1000px of content has `scrollHeight=1000`; assigning that to `scrollTop` jumps the view to the end. `nextTick()` is needed before this in Vue so the DOM has rendered the new content before reading `scrollHeight`.
- **2026-04-13** — **WebSocket auth + `toOthers()` wiring:** `broadcast()->toOthers()` in Laravel requires the frontend to send the `X-Socket-ID` header on every API request — without it, Reverb broadcasts back to the sender too (causing duplicate/empty messages). The axios request interceptor reads `echo.socketId()` and injects it. The `authorizer` in `echo.js` handles private channel auth by posting to `/broadcasting/auth` using `fetch` (not the axios instance) to avoid a circular import: `echo.js` must not import `axios.js` if `axios.js` imports `echo.js`. Using `fetch` with `credentials: 'include'` sends the session cookie for Sanctum auth without creating a dependency cycle.
- **2026-04-13** — **Echo `authorizer` vs default auth:** By default, Laravel Echo derives the auth URL from `window.location.origin`, which in a Vite dev setup points to port 5173 (not Laravel's 8000) — causing a 404. The custom `authorizer` function in `echo.js` overrides this by pointing directly to `VITE_API_URL/broadcasting/auth`. The `authorizer` receives the `channel` object (with `channel.name` like `private-conversation.5`) and a `socketId`, and must call `callback(null, data)` on success or `callback(err)` on failure — Pusher.js uses this callback to complete the subscription handshake. To inspect WebSocket frames in the browser DevTools → Network tab → filter by WS → click the connection → Messages tab: outgoing `pusher:subscribe` frames carry the `auth` token returned by your authorizer.
- **2026-04-14** — **Pinia auth state is not reactive to `localStorage`:** `const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))` reads `localStorage` once when the store is created, then keeps the result in `user.value`. `isAuthenticated = computed(() => !!user.value)` reacts to that in-memory ref, not to future `localStorage` changes. So `localStorage.removeItem('user')` alone does not update the store; the app must also call `setUser(null)` or `clearUser()`. This is why a global axios `401` handler should clear the Pinia auth store itself before redirecting to `login`.
- **2026-04-14** — **`restoreSession()` and `useAuthStore(pinia)` in `main.js`:** the frontend caches the user object locally, but the real session still lives on the backend cookie. On app startup, `restoreSession()` runs once, and only if a cached user exists, to call `/api/user` and verify that the backend session is still valid; if that request returns `401`, it clears the stale cached user before the router renders protected UI. In `main.js`, `const auth = useAuthStore(pinia)` passes the explicit Pinia instance because this code runs outside a Vue component setup context, where `useAuthStore()` without arguments may not yet have an active store container to attach to.
- **2026-04-14** — **`NotificationBell` `variant` prop + `<Teleport>`:** the bell is reused in both the sidebar (`variant="sidebar"`, renders as a full-width nav row with label) and the navbar (`variant="navbar"`, renders as a `w-10 h-10 rounded-full` button). The dropdown panel is always `<Teleport to="body">` so it escapes any ancestor `overflow-hidden` container (the sidebar clips child overflow). Panel position is calculated via `getBoundingClientRect()` on the button ref at open time. Unread badge position differs by variant: `top-1.5 left-5` in the sidebar (over the icon), `top-1 right-1` in the navbar (standard top-right corner). `time_ago` is provided by the backend using Laravel's `diffForHumans()` to avoid duplicating time-formatting logic on the frontend.
- **2026-04-14** — **`watch` in Vue 3:** `watch(source, callback)` runs the callback when a specific ref/computed changes — explicit and receives `(newValue, oldValue)`. Use `{ immediate: true }` to fire on mount, `{ deep: true }` for nested objects. Contrast with `watchEffect(() => {...})` which auto-tracks any refs read inside it without naming them explicitly.
- **2026-04-14** — **Transfer Ownership in `MembersTab.vue`:** added `transferOwnership(member)` which calls `PATCH /api/v1/groups/{group}/transfer-ownership` with `{ membership_id }`, then re-fetches the member list and emits `ownership-transferred`. `GroupDetailView.vue` listens for that event and calls `fetchGroup()` to refresh the `group.pivot.role`, which re-evaluates the `isOwner` computed and hides owner-only tabs automatically. Both action buttons (transfer + kick) are disabled while either is in-flight to prevent race conditions.
- **2026-04-14** — **`multipart/form-data` + axios 422 bug:** Never manually set `Content-Type: multipart/form-data` when passing a `FormData` object to axios. Without the `boundary=...` suffix the server cannot parse the body parts and returns 422. Removing the explicit header lets axios auto-generate it with the correct boundary (e.g. `multipart/form-data; boundary=----WebKitFormBoundaryXXX`).
- **2026-04-14** — **Notification click → tab switch via `watch` + regex:** `activeTab = ref(route.query.tab || 'dashboard')` only reads the query once at mount. Adding `watch(() => route.query.tab, (tab) => { if (tab) activeTab.value = tab })` makes it reactive — when `router.push({ query: { tab: 'chat' } })` fires (e.g. from `NotificationBell`), the watcher picks up the new value and switches the tab without remounting the component. The regex `link.match(/\/groups\/(\d+)/)` extracts the group ID from backend links like `/groups/5/expenses/3`; capture group `(\d+)` grabs consecutive digits after `/groups/`. You could skip the regex and use `link.split('/')[2]` instead (since the link format is always `/groups/{id}/...`), but the regex is more explicit about what it expects and won't silently break if the link ever has a query string or extra slashes.
