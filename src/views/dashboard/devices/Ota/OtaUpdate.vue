<template>
    <b-container>
        <b-row align-h="center">
            <b-col md="auto">
                <h1>OTA Update</h1>
            </b-col>
        </b-row>
        <transition name="fade" mode="out-in">

            <!-- SELECT BRANCH -->
            <span v-if="stage === 'branchSelect'">
                <b-row align-h="center">
                    <b-col md="6" style="text-align: right;">
                        <h5>Device Status</h5>
                    </b-col>
                    <b-col md="6">
                        <span id="tooltip-state" :class="deviceOnline ? 'online' : 'offline'">
                            <i class="fa-solid fa-circle"></i>
                        </span>
                        <b-tooltip target="tooltip-state" triggers="hover">
                            {{ deviceOnline ? 'Online' : 'Offline' }}
                        </b-tooltip>
                    </b-col>
                </b-row>
                <b-row align-h="center">
                    <b-col md="6" style="text-align: right;">
                        <h5>Firmware Version</h5>
                    </b-col>
                    <b-col md="6">
                        <span v-if="deviceOnline">{{ deviceState.firmwareVersion }}</span><span v-else>Offline</span>
                    </b-col>
                </b-row>
                <br>
                <b-row>
                    <b-col><version-display branch="develop" label="Develop" variant="develop"
                            @clicked="branchClicked" /></b-col>
                    <b-col><version-display branch="stable" label="Stable" variant="stable"
                            @clicked="branchClicked" /></b-col>
                    <b-col><version-display branch="beta" label="Beta" variant="beta" @clicked="branchClicked" /></b-col>
                </b-row>
                <b-row style="margin-top: 25px; padding: 0 20px;">
                    <b-table :fields="fieldsUpdates" :items="updates" class="ota-table">
                        <template v-slot:cell(version)="data">
                            <b-badge variant="primary">{{ data.value }}</b-badge>
                        </template>
                        <template v-slot:cell(status)="data">
                            <b-badge :variant="getStatusVariant(data.value)">{{ data.value }}</b-badge>
                        </template>
                        <template v-slot:cell(id)="data">
                            {{ decimalToHexString(data.value) }}
                        </template>
                        <template v-slot:cell(startedAt)="data">
                            <relative-time :time="new Date(data.value)" />
                        </template>
                    </b-table>
                </b-row>
            </span>

            <!-- CONFIRM UPDATE -->
            <span v-else-if="stage === 'startUpdate'" style="text-align: center;">
                <b-row align-h="center">
                    <b-col md="auto">
                        <h5>Start update?</h5>
                        <p>You are about to start a OTA Update<br>
                            <br>
                            Branch <b-badge variant="primary">{{ this.branch }}</b-badge> with Version <b-badge
                                variant="primary">{{ this.version }}</b-badge>
                        </p>
                        <br>
                    </b-col>
                </b-row>
                <b-row align-h="center">
                    <b-col md="auto">
                        <b-button style="background-color: var(--main-color)" @click="startUpdate">Update</b-button>
                    </b-col>
                </b-row>
            </span>

            <!-- UPDATE IN PROGRESS -->
            <span v-else-if="stage === 'updateInProgress'" style="text-align: center;">
                <b-row align-h="center">
                    <b-col md="auto">
                        <h5>Update in progress</h5>
                    </b-col>
                </b-row>
                <b-row>
                    <b-progress :value="overAllProgress + partialProgressForOverall" showProgress="true"
                        :variant="finished ? 'success' : 'primary'" max=100></b-progress>
                </b-row>
                <b-row align-h="center">
                    <b-col md="auto">
                        <p>{{ progressTaskName }}</p>
                    </b-col>
                </b-row>
                <b-row>
                    <b-progress :value="deviceInfo.progress * 100" showProgress="true"
                        :variant="finished ? 'success' : 'primary'" max=100></b-progress>
                </b-row>
            </span>

            <!-- UPDATE FINISHED -->
            <span v-else-if="stage === 'updateFinished'" style="text-align: center;">
                <b-row align-h="center">
                    <b-col md="auto">
                        <h5>Update finished</h5>
                        <br>
                        <p>Update finished successfully</p>
                    </b-col>
                </b-row>

                <b-row align-h="center">
                    <b-col md="auto">
                        <router-link :to="'/dashboard/devices'">Back</router-link>
                    </b-col>
                </b-row>
            </span>

            <!-- ROLLBACK -->
            <span v-else-if="stage === 'rollback'" style="text-align: center;">
                <b-row align-h="center">
                    <b-col md="auto">
                        <h5>Device rolled back to previous version</h5>
                    </b-col>
                </b-row>
            </span>

            <!-- ERROR -->
            <span v-else-if="stage === 'error'" style="text-align: center;">
                <b-row align-h="center">
                    <b-col md="auto">
                        <h5>Update failed</h5>
                        <br>
                        <p>{{ deviceInfo.failed }}</p>
                    </b-col>
                </b-row>
            </span>
        </transition>
    </b-container>
</template>

<script>
import { RelativeTime } from "relative-time-vue-component";
import VersionDisplay from './VersionDisplay.vue';

export default {
    components: { VersionDisplay, RelativeTime },
    props: ['id'],
    data() {
        return {
            stage: "branchSelect",
            branch: null,
            version: null,

            online: false,
            firmwareVersion: null,

            deviceInfo: {
                progress: 0,
                progressTask: -2,
                started: false,
                failed: null,
                fatal: false
            },

            crawl: null,

            overAllProgress: 0,
            finalOverAllProgress: 0,

            updates: [],
            fieldsUpdates: [
                {
                    key: 'id',
                    thClass: "width0"
                },
                {
                    key: 'version',
                    thClass: "width0"
                },
                {
                    key: 'status',
                    thClass: "width0"
                },
                {
                    key: 'message',

                },
                {
                    key: 'startedAt',
                    label: 'Started at',
                    thClass: "startedWith"
                }
            ]
        }
    },
    beforeMount() {
        this.registerEmits();
        this.getUpdates();
    },
    methods: {
        registerEmits() {
            this.emitter.on('otaInstallStarted', ({ deviceId, updateId, version }) => {
                if (deviceId !== this.id) return;
                this.deviceInfo.started = true;
                this.deviceInfo.progressTask = -1;
                this.stage = 'updateInProgress';
            });

            this.emitter.on('otaInstallProgress', ({ deviceId, updateId, task, progress }) => {
                if (deviceId !== this.id) return;
                this.stage = 'updateInProgress';

                this.deviceInfo.progress = progress;
                if (this.deviceInfo.progressTask < task) {
                    this.deviceInfo.progressTask = task;
                    this.overallProgressUpdated();
                }
            });

            this.emitter.on('otaInstallFailed', ({ deviceId, updateId, fatal, message }) => {
                if (deviceId !== this.id) return;

                this.deviceInfo.failed = message;
                this.deviceInfo.fatal = fatal;
                this.stage = 'error';
            });

            this.emitter.on('otaRollback', ({ deviceId, updateId }) => {
                if (deviceId !== this.id) return;

                this.stage = 'rollback';
            });

            this.emitter.on('otaInstallSucceeded', ({ deviceId, updateId }) => {
                if (deviceId !== this.id) return;

                this.stage = 'updateFinished';
            });

        },
        branchClicked(branch, version) {
            this.stage = 'startUpdate';
            this.branch = branch;
            this.version = version;
        },
        async startUpdate() {
            this.stage = 'updateInProgress';
            await ws.otaInstall(this.id, this.version);
        },

        async getUpdates() {
            const res = await apiCall.makeCall('GET', '1/devices/' + this.id + '/ota');
            if (res.status !== 200) {
                console.log(res);
                toastr.error(res.data.message, "Failed to get ota updates");
                return;
            }

            this.updates = res.data.data;
        },

        getStatusVariant(status) {
            if (status === 'Finished') {
                return 'success';
            } else if (status === 'Error' || status === 'Timeout') {
                return 'danger';
            }
            return 'primary';
        },
        stopCrawl() {
            if (this.crawl !== null) clearTimeout(this.crawl);
        },
        crawlProgressOverTime(time, upTo) {
            this.stopCrawl();

            const diff = upTo - this.overAllProgress;
            const step = diff / (time / 100);

            this.internalCrawlLoop(step, upTo);
        },
        internalCrawlLoop(step, upTo) {
            this.crawl = setTimeout(() => {
                if (this.overAllProgress < upTo) {
                    this.overAllProgress += step;
                    this.internalCrawlLoop(step, upTo);
                }
            }, 100);
        },
        overallProgressUpdated() {
            this.stopCrawl();
            switch (this.deviceInfo.progressTask) {
                case 0:
                    this.overAllProgress = 1;
                    this.crawlProgressOverTime(4_000, 5)
                    break;
                case 1:
                    this.overAllProgress = 5;
                    break;
                case 2:
                    this.overAllProgress = 6;
                    break;
                case 3:
                    this.overAllProgress = 28;
                    break;
                case 4:
                    this.overAllProgress = 30;
                    break;
                case 5:
                    this.overAllProgress = 79;
                    break;
                case 6:
                    this.overAllProgress = 80;
                    this.crawlProgressOverTime(13_500, 100);
                    break;
                default:
                    break;
            }
        },
        decimalToHexString(number) {
            if (number < 0) {
                number = 0xFFFFFFFF + number + 1;
            }

            return number.toString(16).toUpperCase();
        }
    },
    computed: {
        partialProgressForOverall() {
            switch (this.deviceInfo.progressTask) {
                case 0:
                    return this.deviceInfo.progress * 4;
                case 1:
                    return this.deviceInfo.progress * 2;
                case 2:
                    return this.deviceInfo.progress * 22;
                case 3:
                    return this.deviceInfo.progress * 2;
                case 4:
                    return this.deviceInfo.progress * 49;
                case 5:
                    return this.deviceInfo.progress * 1;
                default:
                    return 0;
            }
        },

        deviceState() {
            const deviceState = this.$store.state.deviceStates[this.id];
            console.log(deviceState);
            return deviceState !== undefined ? deviceState : null;
        },
        deviceOnline() {
            return this.deviceState !== null ? this.deviceState.online : false;
        },

        progressTaskName() {
            switch (this.deviceInfo.progressTask) {
                case -2:
                    return "Waiting for Device";
                case 0:
                    return "Fetching Metadata";
                case 1:
                    return "Preparing for Install";
                case 2:
                    return "Flashing Filesystem";
                case 3:
                    return "Verifying Filesystem";
                case 4:
                    return "Flashing Application";
                case 5:
                    return "Marking Application Bootable";
                case 6:
                    return "Rebooting...";
                default:
                    return `Unkown Task [${this.deviceInfo.progressTask}]`
            }
        }
    }
}
</script>

<style scoped lang="scss">
:deep(.startedWith) {
    width: 200px;
}

.online {
    color: greenyellow;
}

.offline {
    color: red;
}
</style>