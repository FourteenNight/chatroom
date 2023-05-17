import { createRouter, createWebHashHistory } from "vue-router";
import { tokenIsValid, getToken } from "../utils/TokenService";

import Login from "../view/Login.vue";
import Home from "../view/Home.vue";
import NotFound from "../view/404.vue";

const routes = [
	{
		path: "/",
		name: "index",
		// component: Login,
		component: Home,
		meta: { requiresAuth: true },
	},
	{
		path: "/login",
		name: "login",
		component: Login,
		// meta: { requiresAuth: true },
	},
	{
		path: "/home",
		name: "home",
		component: Home,
		meta: { requiresAuth: true },
	},
	{
		path: "/:pathMatch(.*)*",
		name: "notFound",
		component: NotFound,
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

router.beforeEach((to, from, next) => {
	// 需要登录验证
	if (to.meta.requiresAuth) {
		const token = getToken();
		// console.log(token);
		// 不存在token，跳转到登录页面
		if (!token) {
			next({ name: "login" });
			return;
		} else {
			// 存在token，验证token是否有效
			const baseURL = "http://127.0.0.1:9000";
			tokenIsValid(baseURL, token).then((isValid) => {
				console.log(isValid);
				if (isValid) {
					// token有效，放行，进入目标路由
					next();
					return;
				} else {
					// token无效，跳转到登录页面
					next({ name: "login" });
				}
			});
		}
	} else {
		// 不需要登录验证，直接放行
		next();
	}
});

// 在登录验证之后再进行路由跳转
// router.isReady().then(() => {
// 	const currentRoute = router.currentRoute.value;
// 	console.log(currentRoute.meta.requiresAuth && !getToken());
// 	if (currentRoute.meta.requiresAuth && getToken()) {
// 		// 需要登录验证但不存在token，跳转到登录页面
// 		router.push({ name: "login" });
// 	} else if (currentRoute.name === "login" && getToken()) {
// 		// 已经登录，跳转到主页
// 		router.push({ name: "home" });
// 		console.log("22");
// 	} else {
// 		// 其他情况均放行
// 		router.push(currentRoute);
// 	}
// });

export default router;
