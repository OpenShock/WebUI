import axios from 'axios';
import storeF from '@/store'
import router from '@/router'

axios.defaults.withCredentials = true
const state = storeF.getters;

class ApiCall {

	async makeCall(method, path, data) {
		try {
			return await axios({
				method: method,
				url: config.apiUrl + path,
				data: data,
				headers: {
					OpenShockSession: localStorage.getItem("token")
				}
			});
		} catch (err) {
			toastr.error(utils.getError(err), "API interaction failed");
			if(err.response !== undefined && err.response.status === 401) {
				localStorage.removeItem("token");
				router.push('/account/login');
				return undefined;
			}

			throw err;
		}
	}

	async makeCallHeaders(method, path, data, headers) {
		headers.OpenShockSession = localStorage.getItem("token");
		try {
			return await axios({
				method: method,
				url: config.apiUrl + path,
				data: data,
				headers: headers
			});
		} catch (err) {
			toastr.error(utils.getError(err), "API interaction failed");
			if(err.response !== undefined && err.response.status === 401) {
				localStorage.removeItem("token");
				router.push('/account/login');
				return undefined;
			}

			throw err;
		}
	}
}

export default new ApiCall();
