<script lang="ts">
	import ErrorPanel from './ErrorPanelComplete.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { errorStore, clearError, clearAllErrors } from '$lib/error-store.svelte.js';

	// Determine the language for syntax highlighting based on error type
	function getErrorLanguage(error: typeof errorStore.currentError) {
		if (!error) return 'typescript';
		
		if (error.message instanceof Error) return 'javascript';
		if (typeof error.code === 'string' && error.code.includes('JS')) return 'javascript';
		if (error.details?.includes('{') || error.details?.includes('[')) return 'json';
		if (error.details?.includes('GET ') || error.details?.includes('POST ')) return 'bash';
		
		return 'typescript';
	}

	// Format error for display
	function formatErrorMessage(error: typeof errorStore.currentError) {
		if (!error) return '';
		
		if (error.message instanceof Error) {
			return error.message;
		}
		
		return String(error.message);
	}

	// Get title based on error code
	function getErrorTitle(code: number | string) {
		if (typeof code === 'number') {
			switch (code) {
				case 400: return 'Bad Request';
				case 401: return 'Unauthorized';
				case 403: return 'Forbidden';
				case 404: return 'Not Found';
				case 500: return 'Internal Server Error';
				case 502: return 'Bad Gateway';
				case 503: return 'Service Unavailable';
				default: return `HTTP ${code} Error`;
			}
		}
		
		switch (code) {
			case 'NETWORK': return 'Network Error';
			case 'TIMEOUT': return 'Request Timeout';
			case 'JS': return 'JavaScript Error';
			case 'LIVE': return 'Runtime Error';
			default: return 'Application Error';
		}
	}
</script>

<Dialog.Root bind:open={errorStore.isErrorModalOpen} onOpenChange={(open) => {
	if (!open) clearError();
}}>
	<Dialog.Content class="max-w-6xl max-h-[90vh] overflow-hidden">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<span class="text-red-500">⚠️</span>
				{#if errorStore.currentError}
					{getErrorTitle(errorStore.currentError.code)}
				{:else}
					Application Error
				{/if}
			</Dialog.Title>
			<Dialog.Description>
				An error occurred while processing your request. Details are shown below.
			</Dialog.Description>
		</Dialog.Header>

		<div class="overflow-auto max-h-[60vh]">
			{#if errorStore.currentError}
				<ErrorPanel
					errorCode={errorStore.currentError.code}
					errorMessage={formatErrorMessage(errorStore.currentError)}
					errorDetails={errorStore.currentError.details}
					language={getErrorLanguage(errorStore.currentError)}
					startCollapsed={false}
					class="border-0 shadow-none"
				/>
			{/if}
		</div>

		<Dialog.Footer class="flex justify-between">
			<div class="flex gap-2">
				{#if errorStore.errorHistory.length > 1}
					<Button variant="outline" size="sm" on:click={clearAllErrors}>
						Clear All ({errorStore.errorHistory.length})
					</Button>
				{/if}
			</div>
			
			<div class="flex gap-2">
				<Button variant="outline" on:click={() => window.location.reload()}>
					Reload Page
				</Button>
				<Button on:click={clearError}>
					Close
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>