import axios from "axios";

let utils = {
	getCookie(cname) {
		let name = cname + "=";
		let ca = document.cookie.split(';');
		for(let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
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
		const cook = this.getCookie("settings_dark");
		if(cook !== "") {
			return cook === "true";
		}
		return true;
	},
	setDarkMode(dark) {
		localStorage.setItem("dark", dark);
	},
	setCookie(cname, cvalue, exdays) {
		const d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		let expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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
