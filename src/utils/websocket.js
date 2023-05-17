import { reactive } from "vue";
const state = reactive({
	ws: null,
	connected: false,
});

function createWebSocket(url) {
	state.ws = new WebSocket(url);

	state.ws.addEventListener("open", function (event) {
		state.connected = true;
		console.log("WebSocket connected!");
	});

	state.ws.addEventListener("close", function (event) {
		state.connected = false;
		console.log("WebSocket disconnected!");
	});

	state.ws.addEventListener("error", function (event) {
		state.connected = false;
		console.log("WebSocket error!");
	});
}

export default {
	install(app, options) {
		createWebSocket(options.url);
		app.provide("websocket", state);
	},
};
