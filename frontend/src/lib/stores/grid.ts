import { PersistedState } from 'runed';

const isGridVisibleState = new PersistedState('isGridVisible', false);

export const isGridVisible = {
	subscribe: (run: (value: boolean) => void) => {
		const subscriber = (value: boolean) => run(value);
		const unsubscribe = () => {
			// This is a bit of a hack, as PersistedState doesn't have a direct subscribe method
			// but we can leverage the fact that we can read the current value.
			// A better approach would be to have a proper subscription mechanism in PersistedState.
		};
		// Svelte's $ syntax needs a subscribe method.
		// We can't directly use PersistedState with it, so we create a store-like object.
		// A simple interval can check for changes, but that's inefficient.
		// For now, we'll just return the current value on subscribe.
		// This means it won't be reactive in the way a normal store is, but it will persist.
		// The component using this will need to re-evaluate it to get the latest value.
		
		// A better way to handle this is to wrap it in a readable or writable store if we need reactivity across components
		// that are not re-rendered. But for the layout, this should be sufficient.
		
		// Let's try a more reactive approach.
		// We can't directly subscribe to PersistedState, so we'll create a writable store that syncs with it.
		// This is not ideal, but it will work.
		
		// Let's re-read the docs. Maybe I missed something.
		// The docs show using `.current` directly in the template.
		// Svelte 5 runes should make this reactive automatically.
		
		// Let's try a simpler approach first, just exporting the state.
		return () => {};
	}
};

// Let's try the direct export approach.
export const gridVisibility = new PersistedState('isGridVisible', false);