<template>
	<section class="home">
		<section class="sidebar-box">
			<!-- 频道 -->
			<ul>
				<li
					v-for="(item, index) in chat.rooms"
					:key="index"
					@click="roomClick(item)"
					@contextmenu.prevent="handleContextMenu(item)"
				>
					<channel-box
						:name="item.name"
						:msg="item.msg"
						:isPersonal="item.isPersonal"
						:isClick="item.isClick"
					></channel-box>
				</li>
			</ul>
			<about-me :name="user.name"></about-me>
		</section>
		<section class="main">
			<div class="chat-box">
				<div class="room-name">{{ chat.thisRoom }}</div>
				<!-- 聊天消息显示 -->
				<ul ref="scrollRef">
					<li v-for="(item, index) in chat.msgs[chat.thisRoom]" :key="index">
						<show-msg :name="item.name" :time="item.time" :msg="item.msg" :isMsg="item.isMsg"></show-msg>
					</li>
				</ul>
				<!-- 输入框 -->
				<div class="user-input">
					<div class="user-operation">
						<div class="user-upload" @click="uploadFiler">
							<icon-upload />
						</div>
						<!-- <div class="user-image">
							<icon-image />
						</div> -->
					</div>
					<div class="msg-input">
						<a-textarea v-model="user.msg" allow-clear />
						<a-space>
							<a-button type="primary" @click="sendMsg">发送</a-button>
						</a-space>
					</div>
				</div>
			</div>
			<div class="chat-online">
				<p>在线-{{ chat.online.length }}</p>
				<!-- 在线用户 -->
				<ul>
					<li v-for="(item, index) in chat.online" :key="index" @dblclick="addPersonalRoom(item)">
						{{ item.name }}
					</li>
				</ul>
			</div>
		</section>
	</section>
</template>

<script setup>
import { reactive, ref, onMounted, watch, nextTick, h, getCurrentInstance } from "vue";
import channelBox from "@/components/channel-box.vue";
import showMsg from "@/components/show-msg.vue";
import aboutMe from "@/components/about-me.vue";
import { useUserStore, useWebSocketStore } from "@/store";
import { wsApi } from "../../config";
import { Modal } from "@arco-design/web-vue";
import { ModalContent } from "../utils/modal";
import { upload } from "@/api";

const store = useUserStore();
const wsStore = useWebSocketStore();
const chat = reactive({
	rooms: {},
	online: [],
	thisRoom: "",
	msgs: {},
});
const user = reactive({
	account: store.getUser(),
	name: store.getName(),
	msg: "",
	msgsPersonal: {},
});
const scrollRef = ref(null);
const isBroadcast = ref(true);
const proxy = ref(null);
const file = ref(null);

// 发送消息
function sendMsg() {
	if (chat.thisRoom && user.msg) {
		if (isBroadcast.value) {
			wsStore.sendMessage(chat.thisRoom, user.msg);
			user.msg = "";
			return;
		} else {
			for (const item in chat.rooms) {
				const { name } = chat.rooms[item];
				if (name == chat.thisRoom) {
					wsStore.sendMessage(item, user.msg);
					user.msg = "";
					return;
				}
			}
		}
	}
}

function uploadFiler() {
	Modal.info({
		title: `文件上传`,
		content: () =>
			h("input", {
				type: "file",
				onChange: (event) => {
					file.value = event.target.files[0];
				},
			}),
		hideCancel: false,
		onOk: () => {
			const fileName = file.value.name;
			const reader = new FileReader();
			reader.readAsDataURL(file.value);
			// console.log(file.value.name);
			reader.onload = (event) => {
				const dataUrl = event.target?.result?.split(",");
				// console.log(dataUrl[1]);
				upload({ fileName: fileName, fileData: dataUrl[1], sender: user.name, receiver: chat.thisRoom })
					.then((resp) => {
						const { code, msg } = resp;
						// console.log(resp);
						if (code === 200) {
							user.msg = `[files]#${fileName}`;
							sendMsg();
						}
					})
					.catch((error) => {
						console.error(error);
					});
			};
		},
	});
}

// 频道点击
function roomClick(item) {
	item.isClick = true;
	chat.thisRoom = item.name;
	for (const key in chat.rooms) {
		const room = chat.rooms[key].name;
		if (room != item.name) {
			chat.rooms[key].isClick = false;
		}
	}
	if (item.id) {
		isBroadcast.value = true;
	} else {
		isBroadcast.value = false;
	}
}

// 频道右键
function handleContextMenu(item) {
	const message = proxy.value._.appContext.config.globalProperties.$message;
	if (item.id) {
		if (store.getPermissions() == "admin") {
			Modal.info({
				title: item.name,
				content: () =>
					h(
						ModalContent(item, user.name, (resp) => {
							const { code, msg } = resp;
							if (code === 200) {
								message.success({ content: msg });
							}
							if (code === 400) {
								message.error({ content: msg });
							}
						}),
					),
			});
		}
	} else {
		Modal.info({
			title: `正在与 ${item.name} 进行会话`,
			content: "是否进行结束会话?",
			hideCancel: false,
			onOk: () => {
				chat.online.forEach((el) => {
					if (item.name == el.name) {
						delete chat.rooms[el.account];
					}
				});
			},
		});
	}
}

// 添加私人对话频道
function addPersonalRoom(item) {
	const { name, account } = item;
	if (account == user.account) {
		return;
	}
	chat.rooms[account] = {
		name: name,
		msg: "",
		isClick: false,
		isPersonal: true,
	};
}

// 频道聊天 建立连接 & 监听消息
function establishConnectionOfRooms() {
	for (const key in chat.rooms) {
		const { id, name } = chat.rooms[key];
		if (!id) {
			break;
		}
		// ws连接&监听
		if (!wsStore.socket[name]) {
			wsStore.connect(name, `${wsApi.chat}?user=${user.account}&roomName=${name}`);
			wsStore.socket[name].onmessage = (e) => {
				const { type, roomName, sender, time, data } = JSON.parse(e.data);
				console.log(JSON.parse(e.data));

				// 群聊消息
				if (type == "broadcast") {
					for (const item in chat.rooms) {
						if (chat.rooms[item].name == roomName) {
							const msgCut = JSON.parse(data).split("#");
							if (msgCut[0] == "[files]") {
								showMessages({
									roomName: item,
									msgsName: roomName,
									data: {
										sender: sender,
										time: time,
										msg: data,
										isMsg: false,
									},
								});
							} else {
								showMessages({
									roomName: item,
									msgsName: roomName,
									data: {
										sender: sender,
										time: time,
										msg: data,
										isMsg: true,
									},
								});
							}
						}
					}
				}
				// 首次获取聊天记录
				if (type == "only-one-msgs") {
					data.forEach((item) => {
						const { channels_name, content, create_time, user } = item;
						const msgCut = JSON.parse(content).split("#");
						if (msgCut[0] == "[files]") {
							showMessages({
								msgsName: channels_name,
								data: {
									sender: user,
									time: create_time,
									msg: content,
									isMsg: false,
								},
							});
						} else {
							showMessages({
								msgsName: channels_name,
								data: {
									sender: user,
									time: create_time,
									msg: content,
									isMsg: true,
								},
							});
						}
					});
				}
			};
		}
	}
}
// 私人聊天 建立连接 & 监听消息
function establishConnectionOfPersonal() {
	chat.online.forEach((item) => {
		const { name, account } = item;
		if (account != user.account) {
			// ws连接&监听
			if (!wsStore.socket[account]) {
				wsStore.connect(account, `${wsApi.personal}?user=${user.account}&receiver=${account}`);
				wsStore.socket[account].onmessage = (e) => {
					// console.log(JSON.parse(e.data));
					const { type, receiver, sender, time, data } = JSON.parse(e.data);
					// 私人消息
					if (type == "personal") {
						chat.online.forEach((user) => {
							// 接收方
							if (user.name == sender) {
								const msgCut = JSON.parse(data).split("#");
								if (msgCut[0] == "[files]") {
									showMessages({
										roomName: user.account,
										msgsName: sender,
										data: {
											sender: sender,
											time: time,
											msg: data,
											isMsg: false,
										},
									});
								} else {
									showMessages({
										roomName: user.account,
										msgsName: sender,
										data: {
											sender: sender,
											time: time,
											msg: data,
											isMsg: true,
										},
									});
								}
							}
							// 发送方
							if (user.account == receiver) {
								const msgCut = JSON.parse(data).split("#");
								if (msgCut[0] == "[files]") {
									showMessages({
										roomName: receiver,
										msgsName: user.name,
										data: {
											sender: sender,
											time: time,
											msg: data,
											isMsg: false,
										},
									});
								} else {
									showMessages({
										roomName: receiver,
										msgsName: user.name,
										data: {
											sender: sender,
											time: time,
											msg: data,
											isMsg: true,
										},
									});
								}
							}
						});
					}
					// 首次获取聊天记录
					if (type == "only-one-msgs") {
						// console.log(JSON.parse(e.data));
						data.forEach((item) => {
							const { receiver, sender, content, create_time } = item;
							chat.online.forEach((user) => {
								// 接收方
								if (user.name == sender) {
									const msgType = JSON.parse(content).split("#")[0];
									if (msgType == "[files]") {
										showMessages({
											msgsName: sender,
											data: {
												sender: sender,
												time: create_time,
												msg: content,
												isMsg: false,
											},
										});
									} else {
										showMessages({
											msgsName: sender,
											data: {
												sender: sender,
												time: create_time,
												msg: content,
												isMsg: true,
											},
										});
									}
								}
								// 发送方
								if (user.account == receiver) {
									const msgType = JSON.parse(content).split("#")[0];
									if (msgType == "[files]") {
										showMessages({
											msgsName: user.name,
											data: {
												sender: sender,
												time: create_time,
												msg: content,
												isMsg: false,
											},
										});
									} else {
										showMessages({
											msgsName: user.name,
											data: {
												sender: sender,
												time: create_time,
												msg: content,
												isMsg: true,
											},
										});
									}
								}
							});
						});
					}
				};
			}
		}
	});
}

// 刷新聊天界面
function topScrollClick() {
	nextTick(() => {
		scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
	});
}
watch(chat, (newValue, oldValue) => {
	establishConnectionOfRooms();
	establishConnectionOfPersonal();
	topScrollClick();
});

// 消息显示
function showMessages({ roomName, msgsName, data }) {
	const { sender, time, msg, isMsg } = data;
	// 频道模块显示消息
	if (roomName && roomName != user.account) {
		if (!chat.rooms[roomName]) {
			chat.rooms[roomName] = {
				name: sender,
				msg: "",
				isClick: false,
				isPersonal: true,
			};
		}
		chat.rooms[roomName].msg = `${sender}: ${msg}`;
	}
	// 聊天界面消息
	if (msgsName) {
		if (!chat.msgs[msgsName]) {
			chat.msgs[msgsName] = [];
		}
		chat.msgs[msgsName].push({
			name: sender,
			time: time,
			msg: JSON.parse(msg),
			isMsg: isMsg,
		});
	}
}

onMounted(() => {
	proxy.value = getCurrentInstance().proxy;
	wsStore.connect("ws", `${wsApi.ws}?user=${user.account}`);
	wsStore.socket["ws"].onmessage = (e) => {
		const { type, data } = JSON.parse(e.data);
		// 个人用户
		if (type == "user-info") {
			if (data.account == user.account) {
				user.name = data.name;
				store.setName(data.name);
				store.setPermissions(data.type);
			}
		}
		// 在线用户
		if (type == "user-online") {
			chat.online = data;
		}
		// 频道
		if (type == "rooms") {
			let obj = {};
			data.forEach((e) => {
				const { name, id, creator } = e;
				obj[id] = {
					id: id,
					name: name,
					creator: creator,
					msg: " ",
					isClick: false,
					isPersonal: false,
				};
			});
			chat.rooms = obj;
		}
	};
});
</script>

<style lang="less" scoped>
.home {
	@apply w-screen h-screen flex justify-center items-center;
	background: #17181a;
}
.info-modal-content {
	@apply w-screen h-screen flex justify-center items-center;
}
.sidebar-box {
	@apply flex flex-col items-center;
	width: 12rem;
	height: 100%;
	padding: 2rem 0.5rem;
	background: #17181a;
	ul {
		@apply flex flex-col items-center;
		width: 100%;
		height: 100%;
		overflow: auto;
		&::-webkit-scrollbar {
			width: 6px; //对垂直方向滚动条
		}
		//滚动的滑块
		&::-webkit-scrollbar-thumb {
			border-radius: 3px;
			background-color: #bdc3c7//滚动条的颜色;
		}
		//内层滚动槽
		&::-webkit-scrollbar-track-piece {
			// background-color: #ccc;
		}

		li {
			width: 100%;
		}
	}
}
.main {
	@apply flex h-full;
	flex: 1;
	background: #25272a;
	color: #e6eaf0;
	padding: 1rem;
	.chat-box {
		@apply flex flex-col;
		flex: 1;
		ul {
			@apply h-full overflow-auto;
			&::-webkit-scrollbar {
				width: 6px; //对垂直方向滚动条
			}
			//滚动的滑块
			&::-webkit-scrollbar-thumb {
				border-radius: 3px;
				background-color: #bdc3c7//滚动条的颜色;
			}
			//内层滚动槽
			&::-webkit-scrollbar-track-piece {
				// background-color: #ccc;
			}
		}
	}
	.room-name {
		font-size: 2rem;
	}
	.user-input {
		@apply flex flex-col;
		height: 6rem;
		padding: 1rem;
		.user-operation {
			@apply flex;
			font-size: 1.2rem;
			.user-upload,
			.user-image {
				margin: 0 0.5rem;
				cursor: pointer;
			}
		}
		.msg-input {
			@apply flex;
			button {
				margin-left: 5px;
			}
		}
	}

	.chat-online {
		@apply flex flex-col items-center;
		padding: 1rem;
		width: 12rem;
		border-left: #36383d 1px solid;
		font-size: 1rem;
		&:hover {
			cursor: default;
		}
		ul {
			@apply w-full h-full overflow-auto;
			padding-top: 1rem;
			&::-webkit-scrollbar {
				width: 6px; //对垂直方向滚动条
			}
			//滚动的滑块
			&::-webkit-scrollbar-thumb {
				border-radius: 3px;
				background-color: #bdc3c7//滚动条的颜色;
			}
			//内层滚动槽
			&::-webkit-scrollbar-track-piece {
				// background-color: #ccc;
			}
			li {
				@apply w-full flex flex-col items-center;
				padding: 0.5rem;
				user-select: none;
				&:hover {
					background: rgba(255, 255, 255, 0.1);
					backdrop-filter: blur(20px);
					border-radius: 10px;
				}
			}
		}
	}
}
</style>
