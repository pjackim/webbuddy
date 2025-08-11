import { PersistedState } from 'runed';

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

export const store = $state({ screens: [] as Screen[], assets: [] as Asset[] });
export const online = new PersistedState('online', true);
export const selected = $state<string | null>(null);

// Convenient accessors for the arrays
export const screens = () => store.screens;
export const assets = () => store.assets;

const _screensById = $derived(new Map(store.screens.map((sc) => [sc.id, sc])));
export const screensById = () => _screensById;
const _assetsByScreen = $derived.by(() => {
	const map = new Map<string, Asset[]>();
	for (const a of store.assets) {
		const arr = map.get(a.screen_id) || [];
		arr.push(a);
		map.set(a.screen_id, arr);
	}
	for (const [k, arr] of map) arr.sort((a, b) => a.z_index - b.z_index);
	return map;
});
export const assetsByScreen = () => _assetsByScreen;

export function upsertAsset(a: Asset) {
	const idx = store.assets.findIndex((x) => x.id === a.id);
	if (idx >= 0) store.assets[idx] = a;
	else store.assets.push(a);
}

export function removeAsset(id: string) {
	const idx = store.assets.findIndex((a) => a.id === id);
	if (idx >= 0) store.assets.splice(idx, 1);
}

// Convenience setter for cross-module updates
export function setScreens(list: Screen[]) {
	store.screens.length = 0;
	store.screens.push(...list);
}

export function upsertScreen(s: Screen) {
	const idx = store.screens.findIndex((x) => x.id === s.id);
	if (idx >= 0) store.screens[idx] = s;
	else store.screens.push(s);
}

export function removeScreen(id: string) {
	const idx = store.screens.findIndex((s) => s.id === id);
	if (idx >= 0) store.screens.splice(idx, 1);
}

export function getScreen(id: string) {
	return store.screens.find((s) => s.id === id);
}

export function getAsset(id: string) {
	return store.assets.find((a) => a.id === id);
}
