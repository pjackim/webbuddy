import { Dialog as DialogPrimitive } from 'bits-ui';
import Title from '$lib/vendor/shadcn/dialog/dialog-title.svelte';
import Footer from '$lib/vendor/shadcn/dialog/dialog-footer.svelte';
import Header from '$lib/vendor/shadcn/dialog/dialog-header.svelte';
import Overlay from '$lib/vendor/shadcn/dialog/dialog-overlay.svelte';
import OverlayBlur from '$lib/vendor/shadcn/dialog/dialog-overlay-blur.svelte';
import Content from '$lib/vendor/shadcn/dialog/dialog-content.svelte';
import ContentBlur from '$lib/vendor/shadcn/dialog/dialog-content-blur-overlay.svelte';
import Description from '$lib/vendor/shadcn/dialog/dialog-description.svelte';
import Trigger from '$lib/vendor/shadcn/dialog/dialog-trigger.svelte';
import Close from '$lib/vendor/shadcn/dialog/dialog-close.svelte';

const Root = DialogPrimitive.Root;
const Portal = DialogPrimitive.Portal;

export {
	Root,
	Title,
	Portal,
	Footer,
	Header,
	Trigger,
	Overlay,
	OverlayBlur,
	Content,
	ContentBlur,
	Description,
	Close,
	Root as Dialog,
	Title as DialogTitle,
	Portal as DialogPortal,
	Footer as DialogFooter,
	Header as DialogHeader,
	Trigger as DialogTrigger,
	Overlay as DialogOverlay,
	OverlayBlur as DialogOverlayBlur,
	Content as DialogContent,
	ContentBlur as DialogContentBlur,
	Description as DialogDescription,
	Close as DialogClose
};
