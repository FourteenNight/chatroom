import createAxios from "@/utils/axios";
import { baseUrl, userApi } from "@/../config";

const axios = createAxios(baseUrl());

export const login = ({ username, password }) => {
	const data = {
		account: username.trim(),
		password: password.trim(),
	};
	const config = {
		headers: {
			"Content-Type": "application/json",
		},
	};
	return axios
		.post(userApi.login, data, config)
		.then((response) => {
			// console.log(response);
			const { code, msg, data } = response;
			if (code === 200) {
				const res = {
					allowLogin: true,
					data: data,
				};
				return res;
			} else if (code === 400) {
				const res = {
					allowLogin: false,
					msg: msg,
				};
				return res;
			}
		})
		.catch((error) => {
			if (error.response) {
				const { code } = error.response;
				if (code === 400) {
					throw new Error("用户名或密码错误");
				} else if (code === 500) {
					throw new Error("服务器错误");
				}
			} else {
				throw new Error(error.message);
			}
			return Promise.reject(new Error(error.message || "登录失败"));
		});
};
