import { PersistedState } from 'runed';
import { writable, derived, type Writable } from 'svelte/store';

export type Screen = {
	id: string;
	name: string;
	width: number;
	height: number;
	x: number;
	y: number;
};
export type BaseAsset = {
	id: string;
	screen_id: string;
	x: number;
	y: number;
	z_index: number;
	rotation: number;
	scale_x: number;
	scale_y: number;
	type: 'image' | 'text';
};
export type ImageAsset = BaseAsset & {
	type: 'image';
	src: string;
	width?: number;
	height?: number;
	natural_width?: number;
	natural_height?: number;
};
export type TextAsset = BaseAsset & {
	type: 'text';
	text: string;
	font_size: number;
	color: string;
};
export type Asset = ImageAsset | TextAsset;

// Root mutable state backed by Svelte stores (avoid $state in .ts file to fix SSR build error)
interface RootState { screens: Screen[]; assets: Asset[] }
const rootState: Writable<RootState> = writable({ screens: [], assets: [] });
export const online = new PersistedState('online', true);
export const selected: Writable<string | null> = writable(null);

// Helper subscribe-free snapshot access (functions that capture latest value when called)
let _snapshot: RootState = { screens: [], assets: [] };
rootState.subscribe((v) => (_snapshot = v));
export const store = () => _snapshot; // backward compatibility accessor

// Convenient accessors for the arrays
export const screens = () => _snapshot.screens;
export const assets = () => _snapshot.assets;

const screensStore = derived(rootState, ($s) => new Map($s.screens.map((sc) => [sc.id, sc])));
let _screensByIdSnapshot = new Map<string, Screen>();
screensStore.subscribe((m) => (_screensByIdSnapshot = m));
export const screensById = () => _screensByIdSnapshot;

const assetsByScreenStore = derived(rootState, ($s) => {
	const map = new Map<string, Asset[]>();
	for (const a of $s.assets) {
		const arr = map.get(a.screen_id) || [];
		arr.push(a);
		map.set(a.screen_id, arr);
	}
	for (const [, arr] of map) arr.sort((a, b) => a.z_index - b.z_index);
	return map;
});
let _assetsByScreenSnapshot = new Map<string, Asset[]>();
assetsByScreenStore.subscribe((m) => (_assetsByScreenSnapshot = m));
export const assetsByScreen = () => _assetsByScreenSnapshot;

export function upsertAsset(a: Asset) {
	rootState.update((s) => {
		const idx = s.assets.findIndex((x) => x.id === a.id);
		if (idx >= 0) s.assets[idx] = a; else s.assets.push(a);
		return s;
	});
}

export function removeAsset(id: string) {
	rootState.update((s) => {
		const idx = s.assets.findIndex((a) => a.id === id);
		if (idx >= 0) s.assets.splice(idx, 1);
		return s;
	});
}

// Convenience setter for cross-module updates
export function setScreens(list: Screen[]) {
	rootState.update((s) => { s.screens = [...list]; return s; });
}

export function upsertScreen(s: Screen) {
	rootState.update((st) => {
		const idx = st.screens.findIndex((x) => x.id === s.id);
		if (idx >= 0) st.screens[idx] = s; else st.screens.push(s);
		return st;
	});
}

export function removeScreen(id: string) {
	rootState.update((st) => {
		const idx = st.screens.findIndex((s) => s.id === id);
		if (idx >= 0) st.screens.splice(idx, 1);
		return st;
	});
}

export function getScreen(id: string) {
	return _snapshot.screens.find((s) => s.id === id);
}

export function getAsset(id: string) {
	return _snapshot.assets.find((a) => a.id === id);
}

// Export tools store
export * from './tools';
