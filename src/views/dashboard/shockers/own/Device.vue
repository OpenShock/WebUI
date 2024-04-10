<template>
    <b-container class="device">
        <b-row>
            <b-col cols="auto">
                <p>{{ device.name }}</p>
            </b-col>
            <b-col cols="auto">
                <span :id="'tooltip-state' + device.id" :class="!this.onlineState ? 'offline' : 'online'">
                    <i class="fa-solid fa-circle"></i>
                </span>
                <b-tooltip :target="'tooltip-state' + device.id" triggers="hover">
                    {{ !this.onlineState ? 'Offline' : 'Online' }}<span v-if="this.onlineState"><br>Firmware Version: {{
                        getFirmwareVersionString }}</span>
                </b-tooltip>
            </b-col>
            <b-col cols="auto">
                    <span class="live" :id="'tooltip-live' + device.id" :class="{ active: this.lcgState === 1 }"
                        @click="liveClick">LIVE<span v-if="live.rawState === 0"> <i style="color: var(--main-text-color);" class="fas fa-cog fa-spin"></i></span></span>
                    <b-tooltip :target="'tooltip-live' + device.id" triggers="hover">
                        <span v-if="!live.enabled">Connect to Live Control</span>
                        <span v-else-if="live.rawState === 0">Connecting...<br><br>Gateway: {{ live.gateway }}<br>Country: {{ live.gatewayCountry }}</span>
                        <span v-else>Disconnect from Live Control<br><br>Gateway: {{ live.gateway }}<br>Country: {{ live.gatewayCountry }}<br>Latency: {{ live.latency }}ms</span>
                    </b-tooltip>
            </b-col>
        </b-row>
        <b-row>
            <b-col v-for="item in device.shockers" :key="item.id" class="shocker-col">
                <own-shocker :shocker="item" :live-mode="live.rawState === 1"></own-shocker>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import toastr from 'toastr';
import OwnShocker from './OwnShocker.vue'
export default {
    components: { OwnShocker },
    props: ["device"],
    data() {
        return {
            onlineState: false,
            firmwareVersion: null,
            live: {
                enabled: false,
                gateway: null,
                websocket: null,
                rawState: 3,
                latency: 0
            }
        }
    },
    beforeMount() {
        this.onlineState = this.getOnlineState();
        this.firmwareVersion = this.getFirmwareVersion();
        this.emitter.on('deviceStateUpdate', ({ id, data }) => {
            this.onlineState = data.online;
            this.firmwareVersion = data.firmwareVersion;
        });
    },
    mounted() {
        setInterval(() => {
                this.updateWebSocketStatus();
            }, 20);
    },
    methods: {
        liveClick() {
            this.live.enabled = !this.live.enabled;
            if (this.live.enabled) {
                this.startLive();
            } else {
                this.stopLive();
            }
        },
        startLive() {
            this.connectLive();
            this.tickLoop();
        },
        stopLive() {
            this.live.enabled = false;
            this.disconnect();
        },
        async disconnect() {
            this.live.websocket?.close();
        },
        async connectLive() {
            await this.disconnect();

            const res = await apiCall.makeCallNoThrow('GET', '1/devices/' + this.device.id + '/lcg');
            if (res.status !== 200) {
                console.log(res);
                toastr.error(res.data.message, "Failed to connect to live control gateway");
                return;
            }

            this.live.gateway = res.data.data.gateway;
            this.live.gatewayCountry = res.data.data.country;
            this.live.websocket = new WebSocket('wss://' + this.live.gateway + '/1/ws/live/' + this.device.id);
            //this.live.websocket = new WebSocket('wss://localhost:5443/1/ws/live/' + this.device.id);

            this.live.websocket.onclose = (event) => {
                console.log(event, "Live Control Gateway Connection Closed");
                this.live.websocket = null;
                this.live.rawState = 3;
                this.live.latency = 0;
                this.live.enabled = false;
            };

            
            this.live.websocket.onerror = (event) => {
                console.log(event, "Live Control Gateway Connection Error");
                this.live.websocket = null;
                this.live.rawState = 3;
                this.live.latency = 0;
                this.live.enabled = false;
            };

            this.live.websocket.onmessage = (event) => {
                console.log(event.data);

                const json = JSON.parse(event.data);

                switch (json.ResponseType) {
                    case "Ping":
                        this.live.websocket.send(JSON.stringify({
                            RequestType: "Pong",
                            Data: {
                                Timestamp: json.Data.Timestamp
                            }
                        }));
                        break;
                    case "LatencyAnnounce": 

                        this.live.latency = json.Data.OwnLatency;
                        break;
                }
            };
        },
        updateWebSocketStatus() {
            this.live.rawState = this.live.websocket?.readyState;
        },

        tickLoop() {
            if (!this.live.enabled) return;

            this.device.shockers.forEach(shocker => {
                if (!shocker.$live.isDragging) return;

                console.log(shocker.name + " - " + shocker.$live.intensity);

                this.live.websocket.send(JSON.stringify({
                    RequestType: "Frame",
                    Data: {
                        Shocker: shocker.id,
                        Intensity: parseInt(shocker.$live.intensity),
                        Type: shocker.$live.type
                    }
                }));
            });

            setTimeout(() => {
                this.tickLoop();
            }, 100);
        },

        getOnlineState() {
            if (this.$store.state.deviceStates[this.device.id] === undefined) return false;
            return this.$store.state.deviceStates[this.device.id].online;
        },
        getFirmwareVersion() {
            if (this.$store.state.deviceStates[this.device.id] === undefined) return false;
            return this.$store.state.deviceStates[this.device.id].firmwareVersion;
        }
    },
    computed: {
        getFirmwareVersionString() {
            if (this.firmwareVersion === null) return "Older than 7.1.0.0, please upgrade.";
            return this.firmwareVersion;
        },
        lcgState() {
            if(this.live.websocket === null || this.live.rawState === null) return 3;
            return this.live.rawState;
        },
    }
}
</script>

<style scoped lang="scss">
.device {
    border: solid var(--main-seperator-color) 1px;
    border-radius: 10px;
    padding: 20px;

    .shocker-col {
        @media screen and (min-width: 465px) {
            min-width: 375px;
        }

    }

    .live {
        border: 1px solid;
        border-color: var(--main-text-color);
        padding: 0 4px;
        font-size: 10pt;
        background: var(--main-text-color);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        cursor: pointer;

        &.active {
            background: linear-gradient(to right, rgb(185, 123, 255), #e100ff);
            background-clip: text;
            color: transparent;
            -webkit-background-clip: text;


            border-image: linear-gradient(to right, rgb(167, 89, 255), #e100ff);
            border-image-slice: 1;
        }
    }

    .online {
        color: greenyellow;
    }

    .offline {
        color: red;
    }

}
</style>