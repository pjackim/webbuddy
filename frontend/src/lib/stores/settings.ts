import { PersistedState } from 'runed';

// Grid Settings
export interface GridSettings {
	visible: boolean;
	pattern: 'dots' | 'grid';
	size: number;
	dotRadius: number;
	lineThickness: number;
	majorDotRadius: number;
	majorLineThickness: number;
	majorLineInterval: number;
	opacity: number;
	majorOpacity: number;
	color: string;
	majorColor: string;
	backgroundColor: string;
}

// Style Settings
export interface StyleSettings {
	cornerRadius: number;
	glassBlur: number;
	glassOpacity: number;
	borderOpacity: number;
}

// Performance Settings
export interface PerformanceSettings {
	animationDamping: number;
	zoomSensitivity: number;
	minZoom: number;
	maxZoom: number;
	enableAnimations: boolean;
}

// Debug Settings
export interface DebugSettings {
	showFPS: boolean;
	showCoordinates: boolean;
	debugMode: boolean;
	showGrid: boolean;
}

// Default values
const defaultGridSettings: GridSettings = {
	visible: true, // Enable grid by default for professional theme
	pattern: 'grid',
	size: 40,
	dotRadius: 0.7,
	lineThickness: 0.5,
	majorDotRadius: 1.2,
	majorLineThickness: 1,
	majorLineInterval: 5,
	opacity: 0.1,
	majorOpacity: 0.2,
	color: 'hsl(var(--foreground))',
	majorColor: 'hsl(var(--foreground))',
	backgroundColor: 'transparent'
};

const defaultStyleSettings: StyleSettings = {
	cornerRadius: 8,
	glassBlur: 16,
	glassOpacity: 0.3,
	borderOpacity: 0.15
};

const defaultPerformanceSettings: PerformanceSettings = {
	animationDamping: 0.1,
	zoomSensitivity: 0.0012,
	minZoom: 0.2,
	maxZoom: 8,
	enableAnimations: true
};

const defaultDebugSettings: DebugSettings = {
	showFPS: false,
	showCoordinates: false,
	debugMode: false,
	showGrid: false
};

// Create persistent stores
export const gridSettings = new PersistedState('gridSettings', defaultGridSettings);
export const styleSettings = new PersistedState('styleSettings', defaultStyleSettings);
export const performanceSettings = new PersistedState('performanceSettings', defaultPerformanceSettings);
export const debugSettings = new PersistedState('debugSettings', defaultDebugSettings);

// Convenience functions to get current values
export const getGridSettings = () => gridSettings.current;
export const getStyleSettings = () => styleSettings.current;
export const getPerformanceSettings = () => performanceSettings.current;
export const getDebugSettings = () => debugSettings.current;

// Update functions
export const updateGridSettings = (updates: Partial<GridSettings>) => {
	gridSettings.current = { ...gridSettings.current, ...updates };
};

export const updateStyleSettings = (updates: Partial<StyleSettings>) => {
	styleSettings.current = { ...styleSettings.current, ...updates };
};

export const updatePerformanceSettings = (updates: Partial<PerformanceSettings>) => {
	performanceSettings.current = { ...performanceSettings.current, ...updates };
};

export const updateDebugSettings = (updates: Partial<DebugSettings>) => {
	debugSettings.current = { ...debugSettings.current, ...updates };
};

// Reset functions
export const resetGridSettings = () => {
	gridSettings.current = { ...defaultGridSettings };
};

export const resetStyleSettings = () => {
	styleSettings.current = { ...defaultStyleSettings };
};

export const resetPerformanceSettings = () => {
	performanceSettings.current = { ...defaultPerformanceSettings };
};

export const resetDebugSettings = () => {
	debugSettings.current = { ...defaultDebugSettings };
};

export const resetAllSettings = () => {
	resetGridSettings();
	resetStyleSettings();
	resetPerformanceSettings();
	resetDebugSettings();
};