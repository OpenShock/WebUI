import * as signalR from '@microsoft/signalr'
import storeF from '@/store'
import router from '@/router'

export default class ws {
    async control(id, intensity, duration, type, customName = null) {
        const ctrl = [
            {
                Id: id,
                Type: type,
                Duration: duration,
                Intensity: intensity
            },
        ];

        await this.controlMultiple(ctrl, customName);
    }

    async controlMultiple(shocks, customName) {
        const res = await this.connection.invoke("ControlV2", shocks, customName);
    }

    async captive(deviceId, enabled) {
        await this.connection.invoke("CaptivePortal", deviceId, enabled);
    }

    constructor() {

        this.connection = new signalR.HubConnectionBuilder()
        .withUrl(config.apiUrl + "1/hubs/user?session=" + localStorage.getItem("token"))
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 10000, 15000, 30000, 60000])
        .build();

        this.connection.on("DeviceStatus", (states) => {
            states.forEach(state => {
                storeF.dispatch('setDeviceState', {
                    id: state.device,
                    online: state.online,
                    firmwareVersion: state.firmwareVersion
                })
            });
        });

        setInterval(() => {
            if(storeF.state.userHubState != this.connection._connectionState) {
                storeF.commit('setUserHubState', this.connection._connectionState);
            }
        }, 200);
    }

    start() {
        this.connection.start().catch((err) => {
            if(err.message && err.message.includes(`Status code '401'`)) {
                localStorage.removeItem("token");
                router.push('/account/login');
            } else toastr.error(err, "User Hub");
        });
    }

    stop() {
        this.connection.stop();
    }
}