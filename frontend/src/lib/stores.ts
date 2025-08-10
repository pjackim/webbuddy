import { writable, derived } from 'svelte/store';
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

export const screens = writable<Screen[]>([]);
export const assets = writable<Asset[]>([]);
// Persist the offline mode preference across sessions
export const online = new PersistedState<boolean>('online', true);
export const selected = writable<string | null>(null);

export const screensById = derived(screens, ($s) => new Map($s.map((sc) => [sc.id, sc])));
export const assetsByScreen = derived(assets, ($a) => {
	const map = new Map<string, Asset[]>();
	for (const a of $a) {
		const arr = map.get(a.screen_id) || [];
		arr.push(a);
		map.set(a.screen_id, arr);
	}
	for (const [k, arr] of map) arr.sort((a, b) => a.z_index - b.z_index);
	return map;
});

export function upsertAsset(a: Asset) {
	assets.update((all) => {
		const idx = all.findIndex((x) => x.id === a.id);
		if (idx >= 0) all[idx] = a;
		else all.push(a);
		return [...all];
	});
}

export function removeAsset(id: string) {
	assets.update((all) => all.filter((a) => a.id !== id));
}

export function upsertScreen(s: Screen) {
	screens.update((all) => {
		const idx = all.findIndex((x) => x.id === s.id);
		if (idx >= 0) all[idx] = s;
		else all.push(s);
		return [...all];
	});
}

export function removeScreen(id: string) {
	screens.update((all) => all.filter((s) => s.id !== id));
}
