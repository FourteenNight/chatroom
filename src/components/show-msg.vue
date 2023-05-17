<template>
	<div class="msg-show">
		<div class="user">
			<div class="user-name">{{ name }}</div>
			<div class="user-time">{{ time }}</div>
		</div>
		<div class="user-msg">{{ msg }}</div>
	</div>
</template>

<script setup>
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
});
</script>

<style lang="less" scoped>
.msg-show {
	flex: 1;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	.user {
		display: flex;
		.user-name {
			font-size: 1.1rem;
		}
		.user-time {
			display: flex;
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
}
</style>
