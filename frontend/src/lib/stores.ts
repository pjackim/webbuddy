import { PersistedState } from 'runed';
import type { Writable } from 'svelte/store';

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

export const screens = $state<Screen[]>([]);
export const assets = $state<Asset[]>([]);
export const online = new PersistedState('online', true);
export const selected = $state<string | null>(null);

export const screensById = $derived(new Map(screens.map((sc) => [sc.id, sc])));
export const assetsByScreen = $derived.by(() => {
	const map = new Map<string, Asset[]>();
	for (const a of assets) {
		const arr = map.get(a.screen_id) || [];
		arr.push(a);
		map.set(a.screen_id, arr);
	}
	for (const [k, arr] of map) arr.sort((a, b) => a.z_index - b.z_index);
	return map;
});

export function upsertAsset(a: Asset) {
	const idx = assets.findIndex((x) => x.id === a.id);
	if (idx >= 0) assets[idx] = a;
	else assets.push(a);
}

export function removeAsset(id: string) {
	const idx = assets.findIndex((a) => a.id === id);
	if (idx >= 0) assets.splice(idx, 1);
}

export function upsertScreen(s: Screen) {
	const idx = screens.findIndex((x) => x.id === s.id);
	if (idx >= 0) screens[idx] = s;
	else screens.push(s);
}

export function removeScreen(id: string) {
	const idx = screens.findIndex((s) => s.id === id);
	if (idx >= 0) screens.splice(idx, 1);
}