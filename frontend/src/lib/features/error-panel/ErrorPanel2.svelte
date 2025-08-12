<script lang="ts">
	import * as Code from '$lib/ui/code';
	import { cn } from '$lib/utils';

	interface Props {
		/** The error code (e.g., 500, 404, 403) */
		errorCode: number | string;
		/** The error message or logs to display */
		errorMessage: string;
		/** Additional error details or stack trace */
		errorDetails?: string;
		/** Language for syntax highlighting (default: 'typescript') */
		language?: 'bash' | 'diff' | 'javascript' | 'json' | 'svelte' | 'typescript';
		/** Whether to show the copy button */
		showCopyButton?: boolean;
		/** Whether to start collapsed (for overflow) */
		startCollapsed?: boolean;
		/** Custom title instead of "Internal Error" */
		title?: string;
		/** Additional CSS classes */
		class?: string;
	}

	let {
		errorCode,
		errorMessage,
		errorDetails,
		language = 'typescript',
		showCopyButton = true,
		startCollapsed = true,
		title,
		class: className
	}: Props = $props();

	// Combine error message and details for display
	const combinedErrorContent = $derived.by(() => {
		if (errorDetails) {
			return `${errorMessage}\n\n${errorDetails}`;
		}
		return errorMessage;
	});

	// Determine the title based on error code or custom title
	const displayTitle = $derived.by(() => {
		if (title) return title;
		if (typeof errorCode === 'number') {
			switch (errorCode) {
				case 400:
					return 'Bad Request';
				case 401:
					return 'Unauthorized';
				case 403:
					return 'Forbidden';
				case 404:
					return 'Not Found';
				case 500:
					return 'Internal Error';
				case 502:
					return 'Bad Gateway';
				case 503:
					return 'Service Unavailable';
				default:
					return 'Error';
			}
		}
		return 'Error';
	});
</script>

<div class={cn('flex flex-col items-center justify-center min-h-[400px] p-8', className)}>
	<!-- Error Code Display -->
	<div class="text-center mb-8">
		<h1 class="text-8xl font-bold text-foreground mb-2">
			{errorCode}
		</h1>
		<h2 class="text-2xl font-medium text-muted-foreground">
			{displayTitle}
		</h2>
	</div>

	<!-- Error Logs/Message Display -->
	<div class="w-full max-w-4xl">
		<Code.Overflow collapsed={startCollapsed}>
			<Code.Root
				code={combinedErrorContent}
				lang={language}
				variant="default"
				class="relative max-h-[600px]"
			>
				{#if showCopyButton}
					<div class="absolute right-2 top-2">
						<Code.CopyButton variant="ghost" size="icon" />
					</div>
				{/if}
			</Code.Root>
		</Code.Overflow>
	</div>
</div>
