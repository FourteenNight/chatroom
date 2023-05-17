<template>
	<div class="channel-box">
		<div class="channel-item" :style="channelStyle">
			<div class="channel-item-up">
				<div class="channel-item-left">
					<icon-at />
					<p>{{ name }}</p>
				</div>
				<div class="channel-item-right">
					<span class="channel-item-link" v-show="!isPersonal">
						<icon-user-group :style="iconStyle" />
					</span>
					<span class="channel-item-settings" v-show="isPersonal">
						<icon-user :style="iconStyle" />
					</span>
				</div>
			</div>
			<div class="channel-item-msg">
				<p>{{ msg }}</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { reactive, watch } from "vue";
const props = defineProps({
	name: {
		type: String,
		default: "",
	},
	msg: {
		type: String,
		default: "",
	},
	isPersonal: {
		type: Boolean,
		default: false,
	},
	isClick: {
		type: Boolean,
		default: false,
	},
});
const iconStyle = reactive({
	color: "#ecf0f1",
	background: "",
	["backdrop-filter"]: "",
	["border-radius"]: "",
});
const channelStyle = reactive({
	background: "",
	["backdrop-filter"]: "",
	["border-radius"]: "",
});
watch(
	() => props.isClick,
	(newVal) => {
		if (newVal) {
			iconStyle.color = "#3498db";
			channelStyle.background = "rgba(255, 255, 255, 0.2)";
			channelStyle["backdrop-filter"] = "blur(20px)";
			channelStyle["border-radius"] = "10px";
		} else {
			iconStyle.color = "#ecf0f1";
			channelStyle.background = "";
			channelStyle["backdrop-filter"] = "";
			channelStyle["border-radius"] = "";
		}
	},
);
</script>

<style lang="less" scoped>
.channel-box {
	width: 100%;
	padding: 1rem 0.5rem;
	height: 4rem;
	flex: 1;
	.channel-item {
		@apply flex flex-col items-center;
		width: 100%;
		color: #ecf0f1;
		font-size: 0.9rem;
		font-weight: 600;
		padding: 0.5rem;
		&:hover {
			cursor: default;
			background: rgba(255, 255, 255, 0.2);
			backdrop-filter: blur(20px);
			border-radius: 10px;
		}
		&:focus {
			background: rgba(255, 255, 255, 0.2);
			backdrop-filter: blur(20px);
			border-radius: 10px;
		}

		.channel-item-up {
			@apply flex items-center;
			width: 100%;
			.channel-item-left {
				@apply flex items-center;
				flex: 1;
			}
			.channel-item-right {
				.channel-item-link,
				.channel-item-settings {
					&:hover {
						cursor: pointer;
					}
				}
			}
		}
		.channel-item-msg {
			font-size: 0.6rem;
			p {
				width: 7rem;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}
}
</style>
