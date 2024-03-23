<template>
    <b-modal v-model="updateModal" title="Update your Device!" ok-title="Update now!" cancel-title="Postpone"
        @ok.prevent="updateLink" @cancel.prevent="cancel" @hide.prevent>

        <b-container>
            <b-row>
                <p>One or more of your devices have a <b>firmware version</b> that is lower than <b>1.0.0</b>.</p>
            </b-row>
            <b-row>
                <p>Please update your device to the latest firmware version to be able to use it in the future.</p>
            </b-row>
        </b-container>
    </b-modal>

    <b-modal v-model="dontBugMeModal" title="Are you sure you dont want to update?" ok-title="Update now!"
        :cancel-title="dontWarnAgain ? 'Dont bug me again' : 'Next time'" @ok.prevent="updateLink"
        @cancel.prevent="nextTime">
        <b-row>
            <p>We are not joking! Anything below 1.0.0 uses a different connection method and will not working correctly
                or at all in the future! Please upgrade!</p>
        </b-row>
        <BFormCheckbox v-model="dontWarnAgain" switch>I understand that my device could stop working at any point and
            dont want to see this popup again.</BFormCheckbox>
    </b-modal>

</template>

<script>

export default {
    data() {
        return {
            updateModal: false,
            dontBugMeModal: false,
            dontWarnAgain: false,

            ownDeviceIds: []
        }
    },

    async beforeMount() {
        await this.getOwnDevices();

        this.emitter.on('deviceStatus', ({ states }) => {
            console.log("received update")
            this.checkForUpdate();
        });

        this.checkForUpdate();
    },

    methods: {
        async getOwnDevices() {
            const res = await apiCall.makeCall('GET', '1/devices');

            const deviceIds = [];
            res.data.data.forEach(device => {
                deviceIds.push(device.id);
            });
            this.ownDeviceIds = deviceIds;
        },

        checkForUpdate() {
            if (localStorage.getItem('dontWarnAgainFirmware')) return;

            const deviceStates = this.$store.state.deviceStates;
            this.ownDeviceIds.forEach(deviceId => {
                if(!deviceStates[deviceId]) {
                    const firmwareVersion = deviceStates[deviceId].firmwareVersion;

                    if((firmwareVersion === null || firmwareVersion.startsWith('0')) && !firmwareVersion.startsWith('0.0.0')) {
                        this.updateModal = true;
                        return;
                    }
                }
            });
        },

        updateLink() {
            window.open('https://next.shocklink.net/flashtool', '_blank');
            this.updateModal = false;
        },

        cancel() {
            this.updateModal = false;
            this.dontBugMeModal = true;
        },

        nextTime() {
            this.dontBugMeModal = false;
            if (this.dontWarnAgain) {
                this.dontBugMeModal = false;
                localStorage.setItem('dontWarnAgainFirmware', true);
            }
        }
    }
}

</script>

<style scoped lang="scss">
b {
    width: auto;
    padding: auto;
}
</style>
