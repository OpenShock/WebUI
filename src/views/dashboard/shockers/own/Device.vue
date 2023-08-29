<template>
    <b-container class="device">
        <b-row>
            <b-col cols="auto">
                <p>{{ device.name }}</p>
            </b-col>
            <b-col>
                <span :id="'tooltip-state' + device.id" :class="!this.onlineState ? 'offline' : 'online'">
            <i class="fa-solid fa-circle"></i>
          </span>
          <b-tooltip :target="'tooltip-state' + device.id" triggers="hover">
            {{ !this.onlineState ? 'Offline' : 'Online'}}<span v-if="this.onlineState"><br>Firmware Version: {{ getFirmwareVersionString }}</span>
          </b-tooltip>
            </b-col>
        </b-row>
        <b-row>
            <b-col v-for="item in device.shockers" :key="item.id" class="shocker-col">
                <own-shocker :shocker="item"></own-shocker>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import OwnShocker from './OwnShocker.vue'
export default {
    components: { OwnShocker },
    props: ["device"],
    data() {
        return {
            onlineState: false,
            firmwareVersion: null
        }
    },
    beforeMount() {
        this.onlineState = this.getOnlineState();
        this.firmwareVersion = this.getFirmwareVersion();
        this.emitter.on('deviceStateUpdate', ({id, data}) => {
            this.onlineState = data.online;
            this.firmwareVersion = data.firmwareVersion;
        });
    },
    methods: {
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
            if(this.firmwareVersion === null) return "Older than 7.1.0.0, please upgrade.";
            return this.firmwareVersion;
        }
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

    .online {
        color: greenyellow;
    }

    .offline {
        color: red;
    }

}
</style>