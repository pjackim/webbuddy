declare module '*button.svelte' {
  import type { SvelteComponent } from 'svelte';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

  // Exported helper from the Svelte component module script
  export const buttonVariants: (args?: Record<string, any>) => string;

  // Exported types from the Svelte component module script
  export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

  export type ButtonProps = (HTMLButtonAttributes & HTMLAnchorAttributes) & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

  // Default export (component)
  export default class Root extends SvelteComponent {}
}
