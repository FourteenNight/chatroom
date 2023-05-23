<template>
	<div class="msg-show">
		<div class="user">
			<div class="user-name">{{ name }}</div>
			<div class="user-time">{{ time }}</div>
		</div>
		<div class="user-msg" v-show="isMsg">{{ msg }}</div>
		<div class="file" v-show="!isMsg">
			<icon-drive-file />
			{{ msg.split("#")[1] }}
			<div class="file-download" @click="download(msg)">
				<icon-arrow-fall />
			</div>
		</div>
	</div>
</template>

<script setup>
import { fileApi } from "@/../config";
const props = defineProps({
	name: {
		type: String,
		default: "",
	},
	msg: {
		type: String,
		default: "",
	},
	time: {
		type: String,
		default: "",
	},
	isMsg: {
		type: Boolean,
		default: true,
	},
});
function download(e) {
	const name = e.split("#")[1];
	const url = `${fileApi.download}?name=${name}`;
	fetch(url)
		.then((res) => res.blob())
		.then((blob) => {
			const a = document.createElement("a");
			const objectUrl = window.URL.createObjectURL(blob);
			a.download = name;
			a.href = objectUrl;
			a.click();
			window.URL.revokeObjectURL(objectUrl);
			a.remove();
		});
}
</script>

<style lang="less" scoped>
.msg-show {
	@apply flex-1 flex flex-col;
	padding: 1rem;
	.user {
		@apply flex;
		.user-name {
			font-size: 1.1rem;
		}
		.user-time {
			@apply flex;
			align-items: center;
			padding-left: 1rem;
			font-size: 0.5rem;
		}
	}
	.user-msg {
		word-wrap: break-word;
		width: 40rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border-radius: 10px;
	}
	.file {
		@apply flex;
		.file-download {
			cursor: pointer;
			margin-left: 3px;
		}
	}
}
</style>
