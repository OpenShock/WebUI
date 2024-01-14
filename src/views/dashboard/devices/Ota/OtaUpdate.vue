<template>
    <b-container>
        <b-row align-h="center">
            <b-col md="auto">
                <h1>OTA Update</h1>
            </b-col>
        </b-row>
        <transition name="fade" mode="out-in">

            <!-- SELECT BRANCH -->
            <b-row v-if="stage === 'branchSelect'">
                <b-col><version-display branch="develop" label="Develop" @clicked="branchClicked" /></b-col>
                <b-col><version-display branch="stable" label="Stable" @clicked="branchClicked" /></b-col>
                <b-col><version-display branch="beta" label="Beta" @clicked="branchClicked" /></b-col>
            </b-row>

            <!-- CONFIRM UPDATE -->
            <span v-else-if="stage === 'startUpdate'" style="text-align: center;">
                <b-row align-h="center">
                    <b-col md="auto" >
                        <h5>Start update?</h5>
                        <p>You are about to start a OTA Update<br>
                        <br>
                        Branch <b><u>{{ this.branch }}</u></b> with Version <b><u>{{ this.version }}</u></b></p>
                        <br>
                    </b-col>
                </b-row>
                <b-row align-h="center">
                    <b-col md="auto">
                        <b-button variant="success" @click="startUpdate">Update</b-button>
                    </b-col>
                </b-row>
            </span>

            <!-- UPDATE IN PROGRESS -->
            <span v-else-if="stage === 'updateInProgress'">
                <b-progress :value="progress" showProgress="true"
                                :variant="finished ? 'success' : 'primary'" max=100></b-progress>

            </span>
        </transition>
    </b-container>
</template>

<script>
import VersionDisplay from './VersionDisplay.vue';

export default {
    components: { VersionDisplay },
    props: ['id'],
    data() {
        return {
            stage: "branchSelect",
            branch: null,
            version: null,
            progress: 0,
            finished: false
        }
    },
    beforeMount() {

    },
    methods: {
        branchClicked(branch, version) {
            this.stage = 'startUpdate';
            this.branch = branch;
            this.version = version;
        },
        async startUpdate() {
            this.stage = 'updateInProgress';
            await ws.otaInstall(this.id, this.version);
        }
    }
}
</script>
+