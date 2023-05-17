import axios from "axios";
import { getToken, tokenIsValid } from "./TokenService.js";
import { useRouter } from "vue-router";
const router = useRouter();

// 封装axios工厂函数
const createAxios = (baseURL) => {
	const axiosInstance = axios.create({
		baseURL,
		headers: {
			Authorization: "Bearer " + getToken(),
		},
	});

	// 添加请求拦截器
	axiosInstance.interceptors.request.use(
		function (config) {
			// 在发送请求之前做些什么
			// 检查token是否存在和有效
			const token = getToken();
			const tokenValid = tokenIsValid(baseURL, token);
			tokenValid
				.then((response) => {
					// 在这里使用response中的数据
					if (token && response) {
						config.headers.Authorization = `Bearer ${token}`;
					} else {
						// 跳转到登录页面或做其他处理
						// router.push("/");
					}
				})
				.catch((error) => {
					// 在这里处理请求失败的情况
					console.log(error);
				});
			return config;
		},
		function (error) {
			// 对请求错误做些什么
			return Promise.reject(error);
		},
	);

	// 响应拦截器
	axiosInstance.interceptors.response.use(
		function (response) {
			// 对响应数据做点什么
			return response.data;
		},
		function (error) {
			// 对响应错误做点什么
			return Promise.reject(error);
		},
	);

	return axiosInstance;
};

export default createAxios;
