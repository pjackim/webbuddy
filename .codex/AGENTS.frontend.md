# WebBuddy Project

This project is a web-based application designed to provide a user-friendly interface for managing and interacting with digital assets in order to build presentations.

## Core technologies

The WebBuddy project is built using the following core technologies:

- Svelte 5
- Sveltekit
- `bun`
- `uv` for python FastAPI Backend

## Libraries

### [runed](https://runed.dev/docs/)

You are required to use the `runed` library as often as possible.  
Allowed `runed` components:

- `active-element`
- `animation-frames`
- `context`
- `debounced`
- `element-rect`
- `element-size`
- `extract`
- `finite-state-machine`
- `interval`
- `is-focus-within`
- `is-idle`
- `is-in-viewport`
- `is-mounted`
- `on-click-outside`
- `persisted-state`
- `pressed-keys`
- `previous`
- `resource`
- `scroll-state`
- `state-history`
- `textarea-autosize`
- `throttled`
- `use-debounce`
- `use-event-listener`
- `use-geolocation`
- `use-intersection-observer`
- `use-interval`
- `use-mutation-observer`
- `use-resize-observer`
- `use-throttle`
- `watch`

- [LLMs](https://github.com/svecosystem/runed/tree/main/sites/docs/src/content/utilities)

## UI Frameworks

If a user's request could be fulfulled, or partially fulfilled, by a component listed under `Allowed Components`, then you are required to use that component from that specific framework. You are forbidden to use any other component from the frameworks listed below unless explicitly stated otherwise.

### [DaisyUI 5](https://daisyui.com/llms.txt)

Allowed DaisyUI Components:

- **Actions**:
  - modal
  - Swap
  - button
  - Theme Controller
- **Data Input**:
  - radio
  - range
  - select
  - input field
  - textarea
  - toggle
- **Feedback**:
  - alert
  - loading
  - progress / radial progress
  - skeleton
  - toast
  - tooltip
- **Navigation**:
  - breadcrumbs
  - steps / timeline
  - menu
  - tab
- **Data Display**:
  - badge
  - diff
  - Kbd
  - stat
  - list
  - label
  - status
- **Layout**:
  - indicator
  - divider
  - Join
  - Mask
  - Stack

### [shadcn](https://shadcn-svelte.com/docs/components)

Allowed `shadcn` components:
- Context Menu (Right Click Menu)
- Hover Card
- Popover
- Resizeable
- Toggle-group
- Toggle
- menu-bar
- Command (search bar)

### [shadcn-extras](https://www.shadcn-svelte-extras.com/)

Allowed `shadcn-extras` components:
- tree-view
- code
- is-mac

### [Pixel UI](https://pixelui.dev/components)

Allowed PixelUI Components:

- Grids
- Header
- Errors
- FAQs
- Features

### [diaper](https://github.com/devantic/diaper)

Allowed Diaper Components:

- Stackable Detached
- Detached sheet
- Photo thumbs using sticky header

[Examples](https://diaperbs.vercel.app)
