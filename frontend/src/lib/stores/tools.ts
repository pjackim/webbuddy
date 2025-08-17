import { writable } from 'svelte/store';

export type ToolType = 'pointer' | 'rectangle' | 'circle' | 'text' | 'eraser';

// Current selected tool state
export const selectedTool = writable<ToolType>('pointer');

// Tool-specific settings
export const toolSettings = writable({
	rectangle: {
		width: 100,
		height: 100,
		fill: '#3b82f6',
		stroke: '#1e40af',
		strokeWidth: 2
	},
	circle: {
		radius: 50,
		fill: '#10b981',
		stroke: '#059669',
		strokeWidth: 2
	},
	text: {
		text: 'Sample Text',
		fontSize: 16,
		fontFamily: 'Arial',
		fill: '#374151',
		stroke: '',
		strokeWidth: 0
	}
});

// Helper function to get current tool
export function getCurrentTool(): ToolType {
	let current: ToolType = 'pointer';
	selectedTool.subscribe(tool => current = tool)();
	return current;
}

// Helper function to set tool
export function setTool(tool: ToolType) {
	selectedTool.set(tool);
}

// Helper function to get tool settings
export function getToolSettings() {
	let current: any = {};
	toolSettings.subscribe(settings => current = settings)();
	return current;
}

// Helper function to update tool settings
export function updateToolSettings(tool: 'rectangle' | 'circle' | 'text', settings: any) {
	toolSettings.update(current => ({
		...current,
		[tool]: { ...current[tool], ...settings }
	}));
}