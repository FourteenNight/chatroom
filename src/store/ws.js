import { defineStore } from "pinia";

export const useWebSocketStore = defineStore("websocket", {
	state: () => ({
		socket: {},
	}),
	actions: {
		connect(namespaced, url) {
			this.socket[namespaced] = new WebSocket(url);

			this.socket[namespaced].onopen = () => {
				console.log(namespaced, "WebSocket connection established");
			};
			this.socket[namespaced].onclose = () => {
				console.log(namespaced, "WebSocket connection closed");
			};
		},
		disconnect(namespaced) {
			if (socket[namespaced]) {
				this.socket[namespaced].close();
			}
		},
		sendMessage(namespaced, message) {
			if (this.socket[namespaced]) {
				this.socket[namespaced].send(JSON.stringify(message));
			}
		},
	},
});
