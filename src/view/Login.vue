<template>
	<div class="login">
		<a-space direction="vertical">
			<a-tooltip content="长度4-16,字母开头,允许字母数字下划线">
				<a-input placeholder="账号" v-model="user.account" @keyup.enter="lineFeed" @blur="checkAccount" allow-clear>
					<template #prepend><icon-user /></template>
				</a-input>
			</a-tooltip>
			<a-tooltip content="长度2-9,允许包含汉字、字母、数字和下划线">
				<a-input placeholder="用户名" v-model="user.name" v-show="!isLogin" @blur="checkName" allow-clear>
					<template #prepend><icon-pen /></template>
				</a-input>
			</a-tooltip>
			<a-tooltip content="长度6-18,以字母开头,允许含字母、数字和下划线">
				<a-input-password placeholder="密码" :ref="classPwd" v-model="user.pwd" @blur="checkPwd" allow-clear>
					<template #prepend><icon-lock /></template>
				</a-input-password>
			</a-tooltip>
			<a-input-password placeholder="确认密码" v-model="user.rePwd" v-show="!isLogin" @blur="checkRePwd" allow-clear>
				<template #prepend><icon-lock /></template>
			</a-input-password>
		</a-space>
		<a-space size="large">
			<a-button type="primary" v-show="isLogin" @click="doLogin">登录</a-button>
			<a-button type="primary" v-show="!isLogin" @click="doRegister">注册</a-button>
			<a-button type="text" v-show="isLogin" @click="toRegister">注册</a-button>
			<a-button type="text" v-show="!isLogin" @click="toLogin">返回登录</a-button>
		</a-space>
	</div>
</template>

<script setup>
import { reactive, ref, onMounted, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store";
import { login, register } from "@/api";
import { accountRegex, passwordRegex, nameRegex } from "@/utils/regex";

const router = useRouter();

const isLogin = ref(true);
const proxy = ref(null);
const allowRegister = ref(true);
const classPwd = ref();
const user = reactive({
	name: "",
	account: "",
	pwd: "",
	rePwd: "",
});

function lineFeed() {
	const pwd = classPwd;
	console.log(pwd);
	// pwd.password.focus();
}

// 登录
function doLogin() {
	if (user.account == "") {
		showMsg("error", "请输入账号");
		return;
	}
	if (user.account != "" && user.pwd == "") {
		showMsg("error", "请输入密码");
		return;
	}

	login({ username: user.account, password: user.pwd })
		.then((resp) => {
			const { allowLogin, data, msg } = resp;
			if (allowLogin) {
				// 将token存储到localStorage
				const token = data.token;
				localStorage.setItem("token", token);
				showNotification("success", "登录成功");
				const store = useUserStore();
				store.setUser(user.account);
				router.push("home");
			} else {
				showNotification("warning", msg);
				return;
			}
		})
		.catch((error) => {
			console.error(error);
			showMsg("error", error);
		});
}

// 确认注册
function doRegister() {
	if (allowRegister.value) {
		register({ account: user.account, name: user.name, password: user.pwd })
			.then((data) => {
				console.log(data);
				const { code, msg } = data;
				if (code == 200) {
					showNotification("success", msg);
					toLogin();
				}
				if (code == 400) {
					showNotification("error", msg);
				}
			})
			.catch((error) => {
				console.error(error);
			});
	} else {
		showNotification("warning", "不允许注册，请检查注册步骤");
	}
}

// 返回注册
function toRegister() {
	toLogin();
	isLogin.value = false;
}
// 返回登录
function toLogin() {
	isLogin.value = true;
	user.name = "";
	user.account = "";
	user.pwd = "";
	user.rePwd = "";
}
// ----------------- 账号验证 -----------------
function checkAccount() {
	// 长度4-16,字母开头,允许字母数字下划线
	check({
		result: accountRegex(user.account),
		pass: {
			type: "success",
			msg: "账号格式正确",
		},
		fail: {
			type: "warning",
			msg: "账号格式错误",
		},
		omit: false,
	});
}
// 长度2-9,允许包含汉字、字母、数字和下划线
function checkName() {
	check({
		result: nameRegex(user.name),
		pass: {
			type: "success",
			msg: "名称格式正确",
		},
		fail: {
			type: "warning",
			msg: "名称格式错误",
		},
		omit: false,
	});
}
// 长度6-18,以字母开头,允许含字母、数字和下划线
function checkPwd() {
	check({
		result: passwordRegex(user.pwd),
		pass: {
			type: "success",
			msg: "密码格式正确",
		},
		fail: {
			type: "warning",
			msg: "密码格式错误",
		},
		omit: false,
	});
}
function checkRePwd() {
	check({
		result: user.pwd == user.rePwd,
		pass: {
			type: "success",
			msg: "两次密码一致",
		},
		fail: {
			type: "warning",
			msg: "密码不一致",
		},
		omit: true,
	});
}

function check(obj) {
	const { result, pass, fail, omit } = obj;
	if (result) {
		if (!omit) {
			allowRegister.value = true;
		}
		showMsg(pass.type, pass.msg);
	} else {
		if (!omit) {
			allowRegister.value = false;
		}
		showMsg(fail.type, fail.msg);
	}
}

function showMsg(type, msg) {
	const message = proxy.value._.appContext.config.globalProperties.$message;
	if (type == "info") {
		message.info({ content: msg });
	}
	if (type == "success") {
		message.success({ content: msg });
	}
	if (type == "warning") {
		message.warning({ content: msg });
	}
	if (type == "error") {
		message.error({ content: msg });
	}
}
function showNotification(type, msg) {
	const notification = proxy.value._.appContext.config.globalProperties.$notification;
	if (type == "info") {
		notification.info({ content: msg });
	}
	if (type == "success") {
		notification.success({ content: msg });
	}
	if (type == "warning") {
		notification.warning({ content: msg });
	}
	if (type == "error") {
		notification.error({ content: msg });
	}
}
onMounted(() => {
	proxy.value = getCurrentInstance().proxy;
});
</script>

<style lang="less">
.login {
	@apply w-screen h-screen flex justify-center items-center flex-col;
	// @apply w-screen h-screen flex items-center;
	background: url(../assets/iTab-768zqv.webp) no-repeat;
	background-size: cover;
	.arco-space-item {
		margin-bottom: 2rem;
		span {
			background: transparent;
		}
	}
	.arco-input-wrapper {
		// border-bottom: 1px solid #34495e;
		&:hover {
			border-left: 2px solid #3498db;
			box-shadow: 10px 0px 12px 2px rgba(0, 0, 255, 0.2);
		}
		&:focus-within,
		&:focus {
			border-color: transparent;
			border-left: 2px solid #27ae60;
		}
	}
}
</style>
