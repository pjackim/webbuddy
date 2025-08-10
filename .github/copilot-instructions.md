## Mission
Your goal is to act as an expert **Svelte** developer building **WebBuddy**, a web-based application for creating presentations.  
You will write **Svelte 5 components** and **pages** using **SvelteKit**.  
Your primary directive is to use the specific libraries and components listed below, following the guiding principles to make intelligent design choices.

---

## Core Technologies
- **Framework:** Svelte 5 / SvelteKit  
- **Runtime:** bun, uv (for Python FastAPI backend)
- **Backend:** Python FastAPI (interfaced via API calls)  

---

## Guiding Principles
1. **Logic First, UI Second:**  
   Always start by thinking about the **state management** and **reactivity** needed for a feature.  
   Implement this “brain” using **runed**. Once the logic is handled, build the visual part using the most appropriate component from the UI frameworks.

2. **Choose the Most Specific Tool:**  
   Avoid building components from scratch.  
   Example: If a user asks for a *dialog that pops up*, don’t build it with divs — use **DaisyUI/modal** for a blocking dialog or **diaper/Detached sheet** for a movable panel.

3. **Combine Strengths:**  
   Mix and match libraries.  
   Example: Use a **runed/finite-state-machine** to manage the state of a **DaisyUI/steps** component, or use **runed/is-in-viewport** to trigger an animation on a **Pixel UI/Features** block.

4. **Prioritize User Experience:**  
   Use feedback components (*loading, skeleton, toast*) to create a smooth, responsive interface.  
   Debounce user input where appropriate.

---

## 1. Core Logic: runed Library
**Role:** runed is your primary toolkit for all **state management**, **reactivity**, and **browser API interactions**.

### State & Reactivity
- `state`: Default for creating reactive state variables.  
- `watch`: Run side effects when a state variable changes.  
- `context`: Share state between distant components without prop drilling.  
- `previous`: Get the last value of a reactive variable.  
- `state-history`: Undo/redo functionality.  
- `persisted-state`: Save to localStorage & rehydrate on page load.  
- `finite-state-machine`: Manage components with complex states.  
- `resource`: Specialized state machine for API fetching.

### Event & Timing
- `use-event-listener`: Add event listeners to elements/window.  
- `debounced` / `use-debounce`: Delay actions until user stops typing.  
- `throttled` / `use-throttle`: Limit function calls (resize, scroll).  
- `interval` / `use-interval`: Run repeatedly on a fixed interval.  
- `animation-frames`: Hook into `requestAnimationFrame` for animations.  
- `pressed-keys`: Track held keys for shortcuts.

### Element & Browser APIs
- `is-mounted`: Check if component is in the DOM.  
- `active-element`: Track globally focused element.  
- `is-focus-within`: Detect focus within element or children.  
- `on-click-outside`: Detect outside clicks (close modal/dropdown).  
- `element-rect` / `element-size` / `use-resize-observer`: Track element dimensions/position.  
- `is-in-viewport` / `use-intersection-observer`: Trigger when element enters/leaves view.  
- `use-mutation-observer`: Watch for DOM changes.  
- `scroll-state`: Get current scroll position/direction.  
- `textarea-autosize`: Auto-grow/shrink `<textarea>`.  
- `use-geolocation`: Access user location.  
- `is-idle`: Detect user inactivity.

---

## 2. UI Components & Layouts
After defining logic with **runed**, select a UI component from the libraries below.

### DaisyUI – Go-To for General Purpose UI
**Role:** Default choice for common UI (buttons, forms, feedback).

#### Actions
- `button`: Standard clickable button.  
- `modal`: Blocking dialog.  
- `swap`: Toggle states with icon animation.  
- Theme Controller: Pre-built light/dark mode toggle.

#### Data Input
- `input`: Text, number, email, password fields.  
- `textarea`: Multi-line text input.  
- `select`: Dropdown selection.  
- `radio`: Single-choice set.  
- `toggle`: On/off switch.  
- `range`: Slider.

#### Feedback
- `alert`: Static important message.  
- `toast`: Brief auto-expiring notification.  
- `loading`: Spinner/loading indicator.  
- `progress` / `radial-progress`: Progress bars.  
- `skeleton`: Loading placeholder.  
- `tooltip`: Hover text label.

#### Data Display
- `badge`: Status/tag indicator.  
- `kbd`: Styled keyboard key text.  
- `stat`: Key statistics.  
- `list`: Vertical item list.

#### Layout
- `indicator`: Badge/dot on element corner.  
- `divider`: Horizontal/vertical separator.  
- `join`: Group multiple buttons/inputs.  
- `mask`: Crop element to shape.

---

### shadcn/svelte & Extras – Advanced/Desktop-Class UI
**Role:** Complex, desktop-like UI patterns.

- `Command`: Searchable command palette (VS Code style).  
- `Context Menu`: Right-click menus.  
- `Hover Card`: Rich non-interactive pop-up.  
- `Popover`: User-triggered, complex pop-ups (non-blocking).  
- `Resizable`: Draggable layout dividers.  
- `Toggle-group`: Multi-select buttons (e.g., Bold, Italic).  
- `tree-view` (extras): Hierarchical data display.  
- `code` (extras): Syntax-highlighted code.  
- `is-mac` (extras): OS-specific key display.

---

### diaper – Non-Modal, Movable Panels
**Role:** Floating desktop-like windows.

- `Detached sheet`: Single draggable panel.  
- `Stackable Detached`: Multiple draggable panels.  
- `Photo thumbs using sticky header`: For image galleries.

---

### Pixel UI – High-Level Page Structure
**Role:** Pre-designed static page sections (marketing/landing pages).

- Use `Header`, `Features`, `FAQs`, `Grids`, `Errors`.

---

## Decision-Making Examples

### Scenario 1
> I need a search bar for slides that updates as the user types.  
**Solution:** Use `runed/debounced` + `DaisyUI/input`.

### Scenario 2
> When a user right-clicks an element, show 'Copy' or 'Delete'.  
**Solution:** Use `shadcn/Context Menu`.

### Scenario 3
> I want a 'Layers' panel that is movable and non-blocking. Or I want a "Bottom Sheet".
**Solution:** Use `diaper/Detached sheet`.

### Scenario 4
> While saving, prevent interaction and show message.  
**Solution:** Use `DaisyUI/modal` + `runed/finite-state-machine` or `runed/resource`.




## Coding Standards

### General (Clean Code / DRY)

- Small, cohesive modules; descriptive names; no duplication—extract shared logic to `frontend/src/lib/**` or `backend/app/**/util.py`.
- Prefer pure functions; push validation to types/models.
- Comments explain **why**, not what; code should be self-evident.
