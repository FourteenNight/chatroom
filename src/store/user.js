import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
	state: () => ({
		user: localStorage.getItem("user"),
		name: "",
		permissions: "",
	}),
	actions: {
		setUser(user) {
			this.user = user;
			localStorage.setItem("user", user);
		},
		removeUser() {
			localStorage.removeItem("user");
		},
		getUser() {
			return this.user;
		},
		setName(name) {
			this.name = name;
		},
		getName() {
			return this.name;
		},
		setPermissions(permissions) {
			this.permissions = permissions;
		},
		getPermissions() {
			return this.permissions;
		},
	},
});
