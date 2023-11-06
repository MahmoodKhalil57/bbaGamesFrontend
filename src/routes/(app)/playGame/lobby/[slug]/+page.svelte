<script lang="ts">
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { sessionHybridUserStore } from '$lib/stores/userStore';
	import { apiSend } from '$lib/client/apiClient';

	export let data: PageData;

	enum PayloadType {
		CHATMESSAGE
	}

	type Payload = {
		payloadType: PayloadType;
		content: string;
	};

	type Message = {
		payloadType: PayloadType;
		content: string;
		author: string;
		timeStamp: string;
	};
	// Create a new store with the given data.
	export const createMessageStore = (ws: WebSocket) => {
		const store = writable<Message[]>([]);
		return {
			subscribe: store.subscribe,
			update: store.update,
			addMessages: (messages: Message[]) => {
				ws.send(JSON.stringify(messages));
				store.update((oldMessages) => [...oldMessages, ...messages]);
			},
			readyState: ws.readyState
		};
	};

	const initWebSocket = async () => {
		if (browser) {
			const route = `/lobby/${data.data.lobbyInfo.roomId}`;
			let ws = new WebSocket('ws://46.101.9.66:8080' + route);
			let messageStore = createMessageStore(ws);
			ws.onmessage = (event) => {
				const incomingPayloads = JSON.parse(event.data) as Payload[];
				for (const incomingPayload of incomingPayloads) {
					switch (incomingPayload.payloadType) {
						case PayloadType.CHATMESSAGE:
							messageStore.update((messages) => [...messages, incomingPayload as Message]);
							break;
					}
				}
			};
			return messageStore;
		}
		return undefined;
	};

	let messageStore: ReturnType<typeof createMessageStore> | undefined = undefined;

	onMount(async () => {
		messageStore = await initWebSocket();
	});

	const postMessage = async (message: string) => {
		await apiSend(fetch).mysteryPotGameRouter.addMessage.POST(
			{
				lobbyId: data.data.lobbyInfo.roomId!,
				message: message
			},
			false
		);
	};
</script>

Welcome to lobby

<button on:click={() => postMessage('New Message')}> Add Message </button>

{JSON.stringify($messageStore)}
