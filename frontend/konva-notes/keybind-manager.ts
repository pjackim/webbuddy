// keybind-manager.ts - Universal Keybind Management System for Konva Applications

export type KeybindCallback = (event: KeyboardEvent) => void | boolean;
export type ModifierKeys = {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  /** platform-aware: Cmd on macOS, Ctrl elsewhere */
  cmdOrCtrl?: boolean;
};

export interface Keybind {
  key: string;
  modifiers?: ModifierKeys;
  callback: KeybindCallback;
  description?: string;
  category?: string;
  enabled?: boolean;
  preventDefault?: boolean;
  /** Optional contexts that must be active for this bind */
  context?: string | string[];
  /** Allow triggering while an input/textarea/contenteditable is focused */
  allowInInputs?: boolean;
}

export class KeybindManager {
  private keybinds: Map<string, Keybind[]> = new Map();
  private isListening = false;
  private enabledCategories = new Set<string>();
  private activeContexts = new Set<string>();
  private ignoreInputs = true;

  constructor() {
    this.enabledCategories.add('default');
  }

  private getKeySignature(key: string, modifiers?: ModifierKeys): string {
    const parts = [] as string[];
    if (modifiers?.ctrl) parts.push('ctrl');
    if (modifiers?.alt) parts.push('alt');
    if (modifiers?.shift) parts.push('shift');
    if (modifiers?.meta) parts.push('meta');
    if (modifiers?.cmdOrCtrl) parts.push(this.isMac() ? 'cmd' : 'ctrl');
    parts.push(key.toLowerCase());
    return parts.join('+');
  }

  private isMac() {
    if (typeof navigator === 'undefined') return false;
    return /mac/i.test(navigator.platform);
  }

  private matchesModifiers(event: KeyboardEvent, modifiers?: ModifierKeys): boolean {
    if (!modifiers) return !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey;

    const wantCtrl = !!modifiers.ctrl || (!!modifiers.cmdOrCtrl && !this.isMac());
    const wantMeta = !!modifiers.meta || (!!modifiers.cmdOrCtrl && this.isMac());

    return (
      wantCtrl === event.ctrlKey &&
      !!modifiers.alt === event.altKey &&
      !!modifiers.shift === event.shiftKey &&
      wantMeta === event.metaKey
    );
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    if (!target || !(target as Element).closest) return false;
    const el = (target as Element).closest('input, textarea, [contenteditable="true"]');
    return !!el;
  }

  private handleKeyEvent = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const binds = this.keybinds.get(key);
    if (!binds) return;

    // Ignore when typing in inputs unless explicitly allowed
    if (this.ignoreInputs && this.isEditableTarget(event.target)) {
      // Only continue if at least one bind allows in inputs
      const hasAllowed = binds.some((b) => b.allowInInputs);
      if (!hasAllowed) return;
    }

    for (const bind of binds) {
      if (!bind.enabled) continue;
      if (bind.category && !this.enabledCategories.has(bind.category)) continue;
      if (bind.context) {
        const contexts = Array.isArray(bind.context) ? bind.context : [bind.context];
        const anyActive = contexts.some((c) => this.activeContexts.has(c));
        if (!anyActive) continue;
      }
      if (!this.matchesModifiers(event, bind.modifiers)) continue;

      if (bind.preventDefault !== false) {
        event.preventDefault();
        event.stopPropagation();
      }

      const result = bind.callback(event);
      if (result !== false) break; // Stop processing if callback didn't return false
    }
  };

  register(keybind: Keybind): () => void {
    const key = keybind.key.toLowerCase();
    const category = keybind.category || 'default';
    const bindWithDefaults = { enabled: true, ...keybind, category };

    if (!this.keybinds.has(key)) {
      this.keybinds.set(key, []);
    }
    this.keybinds.get(key)!.push(bindWithDefaults);

    // Start listening if not already
    if (!this.isListening) {
      this.startListening();
    }

    // Return unregister function
    return () => {
      const binds = this.keybinds.get(key);
      if (binds) {
        const index = binds.indexOf(bindWithDefaults);
        if (index >= 0) binds.splice(index, 1);
        if (binds.length === 0) this.keybinds.delete(key);
      }
    };
  }

  startListening(): void {
    if (this.isListening) return;
    this.isListening = true;
    window.addEventListener('keydown', this.handleKeyEvent, { capture: true });
  }

  stopListening(): void {
    if (!this.isListening) return;
    this.isListening = false;
    window.removeEventListener('keydown', this.handleKeyEvent, { capture: true });
  }

  enableCategory(category: string): void {
    this.enabledCategories.add(category);
  }

  disableCategory(category: string): void {
    this.enabledCategories.delete(category);
  }

  toggleCategory(category: string): void {
    if (this.enabledCategories.has(category)) {
      this.disableCategory(category);
    } else {
      this.enableCategory(category);
    }
  }

  getKeybinds(category?: string): Keybind[] {
    const result: Keybind[] = [];
    for (const binds of this.keybinds.values()) {
      for (const bind of binds) {
        if (!category || bind.category === category) {
          result.push(bind);
        }
      }
    }
    return result;
  }

  generateHelpText(category?: string): string {
    const keybinds = this.getKeybinds(category);
    const grouped: { [category: string]: Keybind[] } = {};
    
    keybinds.forEach(bind => {
      const cat = bind.category || 'default';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(bind);
    });

    let text = '';
    Object.entries(grouped).forEach(([cat, binds]) => {
      text += `\n${cat.toUpperCase()} SHORTCUTS:\n`;
      binds.forEach(bind => {
        const modifiers = [];
        if (bind.modifiers?.ctrl) modifiers.push('Ctrl');
        if (bind.modifiers?.alt) modifiers.push('Alt');
        if (bind.modifiers?.shift) modifiers.push('Shift');
        if (bind.modifiers?.meta) modifiers.push('Cmd');
        const keyCombo = [...modifiers, bind.key.toUpperCase()].join(' + ');
        text += `  ${keyCombo}: ${bind.description || 'No description'}\n`;
      });
    });
    
    return text;
  }

  setActiveContexts(contexts: string[]) {
    this.activeContexts = new Set(contexts);
  }

  pushContext(context: string) {
    this.activeContexts.add(context);
  }

  popContext(context: string) {
    this.activeContexts.delete(context);
  }

  clearContexts() {
    this.activeContexts.clear();
  }

  setIgnoreInputs(ignore: boolean) {
    this.ignoreInputs = ignore;
  }

  destroy(): void {
    this.stopListening();
    this.keybinds.clear();
    this.enabledCategories.clear();
    this.activeContexts.clear();
  }
}

// Singleton instance
export const keybindManager = new KeybindManager();

// Common keybind presets for canvas applications
export const CanvasKeybinds = {
  // Selection shortcuts
  selectAll: (callback: () => void) => keybindManager.register({
    key: 'a',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Select All',
    category: 'selection'
  }),
  
  delete: (callback: () => void) => keybindManager.register({
    key: 'Delete',
    callback: () => callback(),
    description: 'Delete Selected',
    category: 'edit'
  }),
  
  // Edit shortcuts
  copy: (callback: () => void) => keybindManager.register({
    key: 'c',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Copy',
    category: 'edit'
  }),
  
  paste: (callback: () => void) => keybindManager.register({
    key: 'v',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Paste',
    category: 'edit'
  }),
  
  undo: (callback: () => void) => keybindManager.register({
    key: 'z',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Undo',
    category: 'edit'
  }),
  
  redo: (callback: () => void) => keybindManager.register({
    key: 'z',
    modifiers: { cmdOrCtrl: true, shift: true },
    callback: () => callback(),
    description: 'Redo',
    category: 'edit'
  }),
  
  // View shortcuts
  zoomIn: (callback: () => void) => keybindManager.register({
    key: '=',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Zoom In',
    category: 'view'
  }),
  
  zoomOut: (callback: () => void) => keybindManager.register({
    key: '-',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Zoom Out',
    category: 'view'
  }),
  
  zoomFit: (callback: () => void) => keybindManager.register({
    key: '0',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Zoom to Fit',
    category: 'view'
  }),
  
  // Tool shortcuts
  selectTool: (callback: () => void) => keybindManager.register({
    key: 'v',
    callback: () => callback(),
    description: 'Select Tool',
    category: 'tools'
  }),
  
  panTool: (callback: () => void) => keybindManager.register({
    key: ' ',
    callback: () => callback(),
    description: 'Pan Tool (Hold)',
    category: 'tools',
    preventDefault: false
  }),
  
  // Layer shortcuts
  groupSelection: (callback: () => void) => keybindManager.register({
    key: 'g',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Group Selection',
    category: 'layers'
  }),
  
  ungroupSelection: (callback: () => void) => keybindManager.register({
    key: 'g',
    modifiers: { cmdOrCtrl: true, shift: true },
    callback: () => callback(),
    description: 'Ungroup Selection',
    category: 'layers'
  }),
  
  bringToFront: (callback: () => void) => keybindManager.register({
    key: ']',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Bring to Front',
    category: 'layers'
  }),
  
  sendToBack: (callback: () => void) => keybindManager.register({
    key: '[',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Send to Back',
    category: 'layers'
  }),
  
  // Precision movement
  nudgeLeft: (callback: () => void) => keybindManager.register({
    key: 'ArrowLeft',
    callback: () => callback(),
    description: 'Nudge Left',
    category: 'transform'
  }),
  
  nudgeRight: (callback: () => void) => keybindManager.register({
    key: 'ArrowRight',
    callback: () => callback(),
    description: 'Nudge Right',
    category: 'transform'
  }),
  
  nudgeUp: (callback: () => void) => keybindManager.register({
    key: 'ArrowUp',
    callback: () => callback(),
    description: 'Nudge Up',
    category: 'transform'
  }),
  
  nudgeDown: (callback: () => void) => keybindManager.register({
    key: 'ArrowDown',
    callback: () => callback(),
    description: 'Nudge Down',
    category: 'transform'
  }),
  
  // Toggle helpers
  toggleGrid: (callback: () => void) => keybindManager.register({
    key: "'",
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Toggle Grid',
    category: 'helpers'
  }),
  
  toggleSnapping: (callback: () => void) => keybindManager.register({
    key: ';',
    modifiers: { cmdOrCtrl: true },
    callback: () => callback(),
    description: 'Toggle Snapping',
    category: 'helpers'
  })
};

// Svelte action for easy integration
export function keybind(node: HTMLElement, config: Omit<Keybind, 'callback'> & { callback: KeybindCallback }) {
  const unregister = keybindManager.register(config);
  
  return {
    destroy: unregister
  };
}

// Context action: activates a context while element is mounted/focused/hovered
export function keybindContext(node: HTMLElement, context: string) {
  const enter = () => keybindManager.pushContext(context);
  const leave = () => keybindManager.popContext(context);
  enter();
  node.addEventListener('mouseenter', enter);
  node.addEventListener('mouseleave', leave);
  node.addEventListener('focusin', enter);
  node.addEventListener('focusout', leave);
  return { destroy() { leave(); node.removeEventListener('mouseenter', enter); node.removeEventListener('mouseleave', leave); node.removeEventListener('focusin', enter); node.removeEventListener('focusout', leave); } };
}

// Example usage in Svelte:
/*
<div use:keybind={{
  key: 'Delete',
  callback: () => deleteSelected(),
  description: 'Delete selected items',
  category: 'edit'
}}>
  <!-- Your content -->
</div>
*/