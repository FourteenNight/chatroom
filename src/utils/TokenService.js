import axios from "axios";
import { userApi } from "../../config";

const getToken = () => {
	return localStorage.getItem("token");
};

const setToken = (token) => {
	localStorage.setItem("token", token);
};

const removeToken = () => {
	localStorage.removeItem("token");
};

const tokenIsValid = (baseURL, verifiedToken) => {
	const data = {
		token: verifiedToken,
	};
	const config = {
		headers: {
			"Content-Type": "application/json",
		},
	};
	return axios
		.post(`${baseURL}${userApi.verify}`, data, config)
		.then((response) => {
			// console.log(response);
			const { code, msg, token } = response.data;
			if (code === 200) {
				if (msg) {
					setToken(token);
				}
				return true;
			} else if (code === 400) {
				return false;
			}
		})
		.catch((error) => {
			if (error.response) {
				const { code } = error.response;
				if (code === 400) {
					throw new Error("验证错误");
				} else if (code === 500) {
					throw new Error("服务器错误");
				}
			} else {
				throw new Error(error.message);
			}
			return Promise.reject(new Error(error.message || "验证失败"));
		});
};

export { getToken, setToken, removeToken, tokenIsValid };
