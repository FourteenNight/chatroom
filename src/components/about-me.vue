<template>
	<div class="about-me" @click="aboutMeClick">
		<p>{{ name }}</p>
		<div class="icon">
			<icon-settings />
		</div>
		<a-modal width="auto" :visible="aboutMeVisible" @ok="aboutMeOk" simple hide-cancel>
			<section class="about-me-tip">
				<div @click="itemClick">
					<p>修改信息</p>
					<icon-idcard />
				</div>
				<a-modal width="auto" :visible="itemVisible" @ok="itemOk" @cancel="itemCancel" simple>
					<div>
						<a-space class="item-tip">
							<p>修改昵称</p>
							<a-input v-model="user.name" placeholder="名字" allow-clear />
							<p>修改密码</p>
							<a-input-password v-model="user.pwd" placeholder="密码" allow-clear />
						</a-space>
					</div>
				</a-modal>
				<a-popconfirm content="确定退出登录吗?" @Ok="doLogout">
					<div>
						<p>退出登录</p>
						<icon-poweroff />
					</div>
				</a-popconfirm>
			</section>
		</a-modal>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from "vue";
import { revise } from "@/api";
import { logout } from "@/api";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store";
import { removeToken } from "../utils/TokenService";
import { passwordRegex, nameRegex } from "@/utils/regex";

let proxy = ref(null);
const props = defineProps({
	name: {
		type: String,
		default: "",
	},
});
const store = useUserStore();
const router = useRouter();
const account = store.getUser();
const aboutMeVisible = ref(false);
const itemVisible = ref(false);
const user = reactive({
	name: "",
	pwd: "",
});

const aboutMeClick = () => {
	aboutMeVisible.value = true;
};
const itemClick = () => {
	itemVisible.value = true;
};
const aboutMeOk = () => {
	aboutMeVisible.value = false;
};
const itemOk = () => {
	const message = proxy.value._.appContext.config.globalProperties.$message;
	const notification = proxy.value._.appContext.config.globalProperties.$notification;

	if (user.name == "" && user.pwd == "") {
		itemVisible.value = false;
	}
	// 用户名验证
	if (user.name != "") {
		if (nameRegex(user.name)) {
			message.success({ content: "名字格式正确" });
		} else {
			message.warning({ content: "名字格式错误" });
			return;
		}
	}
	// 密码验证
	if (user.pwd != "") {
		if (passwordRegex(user.pwd)) {
			message.success({ content: "密码格式正确" });
		} else {
			message.warning({ content: "密码格式错误" });
			return;
		}
	}
	revise({ account: account, name: user.name, password: user.pwd })
		.then((resp) => {
			const { code, msg } = resp;
			if (code === 200) {
				user.name = "";
				user.pwd = "";
				notification.success({ content: msg });
				itemVisible.value = false;
			}
			if (code === 400) {
				user.name = "";
				user.pwd = "";
				notification.warning({ content: msg });
			}
		})
		.catch((error) => {
			console.error(error);
			showMsg("error", error);
		});
};
const itemCancel = () => {
	user.name = "";
	user.pwd = "";
	itemVisible.value = false;
};

// 退出登录
function doLogout() {
	const notification = proxy.value._.appContext.config.globalProperties.$notification;
	logout(account)
		.then((resp) => {
			const { code, msg } = resp;
			if (code === 200) {
				removeToken();
				store.removeUser();
				notification.success({ content: "退出成功" });
				location.reload();
			} else if (code === 400) {
				notification.warning({ content: msg });
			}
		})
		.catch((error) => {
			console.error(error);
			showMsg("error", error);
		});
}
onMounted(() => {
	proxy.value = getCurrentInstance().proxy;
});
</script>

<style lang="less" scoped>
.about-me {
	@apply justify-between flex;
	// height: 3rem;
	position: relative;
	&:hover {
		cursor: pointer;
	}
	p {
		color: #e6eaf0;
		font-size: 1.5rem;
	}
	.icon {
		color: #e74c3c;
		font-size: 1.2rem;
		position: absolute;
		right: 0;
		bottom: 0;
		transform: translateX(50%) translateY(50%);
	}
}
.about-me-tip {
	// @apply flex;
	font-size: 1.1rem;
	div {
		@apply flex items-center justify-center;
		padding: 0.5rem 4rem;
		&:hover {
			cursor: pointer;
		}
	}
}
.item-tip {
	@apply flex flex-col items-center justify-center;
}
</style>
