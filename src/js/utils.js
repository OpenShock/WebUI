import axios from "axios";
import router from '@/router';

let utils = {
	getLoginSafe() {
		const loggedIn = this.isLoggedIn();
		if(!loggedIn) {
			this.clearLogin();
			return null;
		}
		return localStorage.getItem("token");
	},
	clearLogin() {
		localStorage.removeItem("token");
		router.push('/account/login');
	},
	isLoggedIn() {
		const expiresOnRaw = localStorage.getItem("token_validUntil");
		if(expiresOnRaw === null) return false;
		const tokenExists = localStorage.getItem("token") !== null;
		if(!tokenExists) return false;

		const asDate = new Date(expiresOnRaw);
		if(isNaN(asDate)) return false;

		return asDate > Date.now();
	},
	isDarkMode() {
		const cook = localStorage.getItem("dark");
		if(cook !== null) {
			return cook === "true";
		}
		return true;
	},
	setDarkMode(dark) {
		localStorage.setItem("dark", dark);
	},
	getError(err) {
		if(err !== undefined && err.response !== undefined) {
			if(err.response.data !== undefined && err.response.data.message !== undefined)
				return `${err.response.status} with ${err.response.data.message}`;

			return `${err.response.status} ${err.response.statusText}`;
		}
		return "Something went terribly wrong, no further info."
	},
	toHexString(byteArray) {
		return Array.from(byteArray, function(byte) {
		  return ('0' + (byte & 0xFF).toString(16)).slice(-2);
		}).join('')
	},
	async checkIfLoggedIn() {
		try {
			const res = await axios({
				method: "GET",
				url: config.apiUrl + "1/users/self",
				headers: {
					OpenShockSession: localStorage.getItem("token")
				}
			});

			return res.status === 200;
		} catch (e) {}
		

		return false;
	}
}

global.utils = utils;
