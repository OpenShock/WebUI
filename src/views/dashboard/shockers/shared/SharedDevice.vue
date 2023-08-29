<template>
    <b-container class="device">
        <b-row>
            <b-col cols="auto">
                <p>{{ device.name }}</p>
            </b-col>
            <b-col :class="onlineStateComp">
                <i class="fa-solid fa-circle"></i>
            </b-col>
        </b-row>
        <b-row>
            <b-col v-for="item in device.shockers" :key="item.id" class="shocker-col">
                <shared-shocker :shocker="item"></shared-shocker>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import SharedShocker from './SharedShocker.vue';
export default {
  components: { SharedShocker },
    props: ['device'],
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
        onlineStateComp() {
            return this.onlineState ? 'online' : 'offline';
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
        min-width: 300px;
    }

    .online {
        color: greenyellow;
    }

    .offline {
        color: red;
    }

}
</style>