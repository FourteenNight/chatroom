import createAxios from "@/utils/axios";
import { baseUrl, roomsApi } from "@/../config";

const axios = createAxios(baseUrl());

export const roomAdd = ({ name, user }) => {
	const data = {
		name: name.trim(),
		user: user.trim(),
	};
	const config = {
		headers: {
			"Content-Type": "application/json",
		},
	};
	return axios
		.post(roomsApi.add, data, config)
		.then((response) => {
			return response;
		})
		.catch((error) => {
			if (error.response) {
				const { code } = error.response;
				if (code === 400) {
					throw new Error("错误");
				} else if (code === 500) {
					throw new Error("服务器错误");
				}
			} else {
				throw new Error(error.message);
			}
			return Promise.reject(new Error(error.message || "注册失败"));
		});
};
