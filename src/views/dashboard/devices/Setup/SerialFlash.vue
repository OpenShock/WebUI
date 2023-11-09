<template>
    <b-container class="main">
        <b-row align-h="center" v-if="!supported">
            <b-col md="auto">
                <p>Your browser is not supported. Use Chrome, Edge or Opera</p>
            </b-col>
        </b-row>
        <div v-if="supported">
            <transition name="component-fade" mode="out-in">
                <div v-if="stage === 'connect'">
                    <b-row align-h="center">
                        <b-col md="auto">
                            <loading-button @click="serialConnect" :loading="connect.connecting"
                                :text="connect.connecting ? 'Connecting...' : 'Connect to ESP'"
                                :disabled="connect.connecting" />
                        </b-col>
                    </b-row>
                </div>

                <div v-else-if="stage === 'serial-read'">
                    <b-row>
                        <p>Read previous data of ESP</p>
                    </b-row>
                    <b-row v-if="!download.started" align-h="center">
                        <b-col md="auto">
                            <b-button @click="downloadFirmware">Download</b-button>
                        </b-col>
                    </b-row>
                    <b-row v-else>
                        <div>
                            <b-progress :value="download.progress" showProgress="true"
                                :variant="download.finished ? 'success' : 'primary'" max=1></b-progress>
                        </div>
                        <div v-if="download.finished && download.success">
                            <b-button @click="stage = 'connect'">Next</b-button>
                        </div>
                    </b-row>
                </div>

                <div v-else-if="stage === 'download'">
                    <b-row>
                        <p>{{ download.state }}</p>
                    </b-row>
                    <b-row v-if="!download.started" align-h="center">
                        <b-col md="auto">
                            <b-button @click="downloadFirmware">Download</b-button>
                        </b-col>
                    </b-row>
                    <b-row v-else>
                        <div>
                            <b-progress :value="download.progress" showProgress="true"
                                :variant="download.finished ? 'success' : 'primary'" max=1></b-progress>
                        </div>
                        <br>
                        <div v-if="download.finished && download.success">
                            <b-button @click="stage = 'stuv'">Next</b-button>
                        </div>
                    </b-row>
                </div>

                <div v-else-if="stage === 'stub'">
                    <b-row>
                        <div align-h="center" v-if="!flash.started">
                            <b-row align-h="center">
                                <b-col md="auto">
                                    <loading-button @click="runStub" :loading="stub.started"
                                        :text="stub.started ? 'Stub uploading...' : 'Run Stub'"
                                        :disabled="stub.started" />
                                </b-col>
                            </b-row>
                        </div>
                        <div v-else>
                            <b-progress :value="flash.progress" showProgress="true"
                                :variant="flash.finished ? 'success' : 'primary'" max=1></b-progress>
                        </div>
                    </b-row>
                </div>

                <div v-else-if="stage === 'flash'">
                    <b-row>
                        <div align-h="center" v-if="!flash.started">
                            <b-col md="auto">
                                <b-button @click="flashData">Flash</b-button>
                            </b-col>
                        </div>
                        <div v-else>
                            <b-progress :value="flash.progress" showProgress="true"
                                :variant="flash.finished ? 'success' : 'primary'" max=1></b-progress>
                        </div>
                    </b-row>
                </div>
            </transition>
        </div>
    </b-container>
    <br>
    <div id="terminal" class="terminal"></div>
</template>
<script>
require('xterm/css/xterm.css');
import ApiCall from '../../../../js/ApiCall.js';
import LoadingButton from '../../../utils/LoadingButton.vue';
import { Terminal } from 'xterm';
import SerialManager from './SerialManager.js';

export default {
    components: { LoadingButton },
    data() {
        return {
            stage: 'connect',
            firmware: undefined,
            download: {
                started: false,
                finished: false,
                success: false,
                state: "Press download to start firmware download",
                progress: 0
            },
            connect: {
                connecting: false,
                connected: false
            },
            stub: {
                started: false,
                finished: false
            },
            flash: {
                firmware: undefined,
                started: false,
                finished: false,
                progress: 0,
                state: "Press flash to start flashing your device"
            },
            text: "",

            terminal: undefined,
            // Serial Manager
            serialManager: undefined
        }
    },
    mounted() {
        this.terminal = new Terminal({ cols: 120, rows: 20 });
        this.terminal.open(document.getElementById('terminal'));
        this.terminal.write('\x1B[1;1;31mOpenShock\x1B[0m Flashing Utility');

        this.serialManager = new SerialManager(
            () => {
                this.terminal.clear();
            },
            (data) => {
                this.terminal.writeln(data);
            },
            (data) => {
                this.terminal.write(data);
            },
            (fileIndex, written, total) => {
                console.log(written / total);
                this.flash.progress = written / total;
            }
        );
    },
    methods: {
        async erase() {
            await this.serialManager.erase();
        },
        ui8ToBstr(u8Array) {
            let b_str = "";
            for (let i = 0; i < u8Array.length; i++) {
                b_str += String.fromCharCode(u8Array[i]);
            }
            return b_str;
        },
        async downloadFirmware() {
            this.download.started = true;

            try {
                const versionRes = await ApiCall.makeCall("GET", "1/public/firmware/version");
                this.download.state = 'Fetched Firmware version ' + versionRes.data.data.version;
                const response = await fetch(versionRes.data.data.downloadUri);
                this.download.state = 'Downloading Firmware version ' + versionRes.data.data.version + '...';

                const totalDownloadBytes = response.headers.get("content-length");
                let bytesDownloaded = 0;
                const chunks = [];
                const reader = response.body.getReader();
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        this.download.progress = 1;
                        break;
                    }
                    chunks.push(value);
                    bytesDownloaded += value.length;
                    if (totalDownloadBytes != undefined) {
                        this.download.progress = bytesDownloaded / totalDownloadBytes;
                    }
                }

                const blob = new Blob(chunks);
                const arrayBuffer = await blob.arrayBuffer();
                var uint8View = new Uint8Array(arrayBuffer);
                this.download.firmware = this.ui8ToBstr(uint8View);
                this.download.state = 'Finished downloading Firmware version ' + versionRes.data.data.version;
                this.download.success = true;
                this.download.finished = true;
            } catch (error) {
                toastr.error("Error downloading firmware", error);
                this.download.state = 'Error downloading firmware';
                this.download.success = false;
                this.download.finished = true;
            }
        },
        async runStub() {
            this.stub.started = true;
            await this.serialManager.connect();
            await this.serialManager.loadStub();
            this.stub.finished = true;
        },
        async flashData() {
            this.flash.started = true;
            await this.serialManager.flash(this.download.firmware);
            this.flash.finished = true;
        },
        async serialConnect() {

            this.connect.connecting = true;
            await this.serialManager.startConsole();
            this.connect.connected = true;
            this.stage = "download";
        },
        formatMacAddr(macAddr) {
            return macAddr.map((value) => value.toString(16).toUpperCase().padStart(2, "0")).join(":");
        }
    },
    computed: {
        logsFormatted() {
            return this.logs.join("\n");
        },
        supported() {
            return ('serial' in navigator)
        }
    }
}
</script>

<style scoped lang="scss">
.main {
    text-align: center;
}

:deep(.xterm-viewport) {
    overflow: hidden;
}
</style>