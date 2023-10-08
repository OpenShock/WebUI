import axios from "axios";
import router from '@/router';

let utils = {
	clearLogin() {
		router.push('/account/login');
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
	async checkIfLoggedIn() {
		try {
			const res = await axios({
				method: "GET",
				url: config.apiUrl + "1/users/self"
			});

			return res.status === 200;
		} catch (e) {}
		

		return false;
	}
}

global.utils = utils;
