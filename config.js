const base = {
	ip: "127.0.0.1",
	port: 9000,
};

const baseUrl = () => {
	return `http://${base.ip}:${base.port}`;
};

const wsUrl = () => {
	return `ws://${base.ip}:${base.port}`;
};

const userApi = {
	login: "/api/user/login",
	logout: "/api/user/logout",
	register: "/api/user/register",
	revise: "/api/user/revise",
	verify: "/api/token/verify",
};

const roomsApi = {
	update: "/api/rooms/update",
	add: "/api/rooms/add",
	del: "/api/rooms/del",
};

const wsApi = {
	ws: `${wsUrl()}/ws`,
	chat: `${wsUrl()}/chat`,
	personal: `${wsUrl()}/personal`,
};

export { baseUrl, userApi, wsApi, roomsApi };
