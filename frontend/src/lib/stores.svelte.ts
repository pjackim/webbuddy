// Compatibility shim for legacy imports.
// Some components import "$lib/stores.svelte.ts"; the actual module lives at "$lib/stores".
// This file re-exports from "./stores" so both paths work.
export * from './stores';
