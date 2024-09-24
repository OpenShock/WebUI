import { createStore } from 'vuex';
import axios from "axios";

const store = createStore({
	state() {
		return {
			user: {
				id: "",
				name: "",
				image: ""
			},
			secondLevelNav: [],
			settings: {
				dark: true
			},
			deviceStates: {},
			userHubState: "Initializing",
			returnUrl: undefined,
			proxy: {
				customName: undefined
			}
		}
	},
	getters: {
		getAuthKey: (state) => () => state.authKey
	},
	mutations: {
		setUser(state, user) {
			state.user = user;
		},
		setAuthKey(state, authKey) {
			state.authKey = authKey;
		},
		setSNav(state, nav) {
			state.secondLevelNav = nav;
		},
		setDarkMode(state, dark) {
			state.settings.dark = dark;
		},
		setDeviceState(state, { id, online, firmwareVersion }) {
			const data = {
				online,
				firmwareVersion
			};
			state.deviceStates[id] = data;

			emitter.emit('deviceStateUpdate', { id, data });
		},
		setUserHubState(state, newState) {
			state.userHubState = newState;
		},
		setReturnUrl(state, url) {
			state.returnUrl = url;
		},
		setCustomName(state, name) {
			state.proxy.customName = name;
		},
	},
	actions: {
		setNewNav({ commit, state }, nav) {
			const timeout = state.secondLevelNav.length > 0;
			commit('setSNav', []);
			if (timeout) {
				setTimeout(() => {
					commit('setSNav', nav);
				}, 200);
			} else {
				commit('setSNav', nav);
			}
		},
		setDarkMode({ commit }, dark) {
			commit('setDarkMode', dark);
			utils.setDarkMode(dark);
		},
		setDeviceState({ commit }, { id, online, firmwareVersion }) {
			commit('setDeviceState', { id, online, firmwareVersion });
		},
		async getSelf({ commit }) {
			try {
				const res = await axios({
					method: "GET",
					url: config.apiUrl + "1/users/self"
				});

				if (res.status === 200) {
					const data = res.data.data;
					commit('setUser', {
						id: data.id,
						name: data.name,
						image: data.image,
						rank: data.rank

					});
					console.log("Successfully fetched self");
					return;
				} else if(res.status === 401) {
					emitter.emit('logout');
					return;
				} else console.log("Self status code is " + res.status + " with message " + res.data);
			} catch (e) {
				console.log(e);
			}
			console.log("Seems like the session is invalid, expired or user just never logged in, sending to login page");
		},
		setReturnUrl({ commit }, url) {
			commit('setReturnUrl', url);
		}
	},
	modules: {

	}
})

export default store
