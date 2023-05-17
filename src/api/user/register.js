import createAxios from "@/utils/axios";
import { baseUrl, userApi } from "@/../config";

const axios = createAxios(baseUrl());

export const register = ({ account, name, password }) => {
	const data = {
		account: account.trim(),
		name: name.trim(),
		password: password.trim(),
	};
	const config = {
		headers: {
			"Content-Type": "application/json",
		},
	};
	return axios
		.post(userApi.register, data, config)
		.then((response) => {
			return response;
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
			return Promise.reject(new Error(error.message || "注册失败"));
		});
};
