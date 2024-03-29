<template>
    <b-container class="shocker">
        <b-row class="head">
            <b-col cols="auto" class="pause-col" @click="togglePause">
                <span v-if="pausedOnShareLinkLevel" class="paused">
                    <i class="fa-solid fa-play"></i>
                </span>

                <span v-else>
                    <i class="fa-solid fa-pause"></i>
                </span>
            </b-col>
            <b-col cols="10" class="shocker-name-col">
                <p class="shocker-name">{{ shocker.name }}</p>
            </b-col>
            <b-col cols="auto" class="elli" @click="ellipsis">
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </b-col>
        </b-row>

        <b-row>
            <b-container align-items="center" style="margin-top: 15px">
                <b-row align-h="center">
                    <b-col md="auto" style="width: unset">
                        <round-slider v-model="limit.intensity" pathColor="#1b1d1e" rangeColor="#f16051" start-angle="315"
                            end-angle="+270" width="30" line-cap="round" radius="75" />

                        <p style="text-align: center;">Intensity Limit</p>
                    </b-col>
                    <b-col md="auto" style="width: unset">
                        <round-slider v-model="limit.duration" pathColor="#1b1d1e" rangeColor="#f16051" start-angle="315"
                            end-angle="+270" line-cap="round" radius="75" width="30" min="0.3" max="30" step="0.1" />

                        <p style="text-align: center;">Duration Limit</p>
                    </b-col>
                </b-row>
            </b-container>
        </b-row>

        <b-row align-h="center">
            <b-col cols="auto" md="auto">
                <permission-button style="width: 46px" icon="fa-solid fa-volume-high" :state="shocker.permissions.sound"
                    @click="shocker.permissions.sound = !shocker.permissions.sound" />
            </b-col>
            <b-col cols="auto" md="auto">
                <permission-button style="width: 46px" icon="fa-solid fa-water" :state="shocker.permissions.vibrate"
                    @click="shocker.permissions.vibrate = !shocker.permissions.vibrate" />
            </b-col>
            <b-col cols="auto" md="auto">
                <permission-button style="left: 0; width: 46px" icon="fa-solid fa-bolt" :state="shocker.permissions.shock"
                    @click="shocker.permissions.shock = !shocker.permissions.shock" />
            </b-col>
            <b-col class="save-button" v-if="modified">
                <b-button variant="nano" @click="saveChanges"><i class="fa-solid fa-floppy-disk"></i></b-button>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import PR from '@/js/PauseReason.js';
import RoundSlider from 'vue-three-round-slider';
import ControlButton from '../../../../utils/ControlButton.vue';
import Loading from '../../../../utils/Loading.vue';
import PermissionButton from './PermissionButton.vue';


export default {
    components: { Loading, RoundSlider, ControlButton, PermissionButton },

    props: ["shocker", "editMode"],
    data() {
        return {
            modified: false,
            limit: {
                duration: null,
                intensity: null
            }
        }
    },
    beforeMount() {
        this.loadTranslatedValues();
    },
    methods: {
        loadTranslatedValues() {
            this.limit.duration = this.shocker.limits.duration === null ? 30 : this.shocker.limits.duration / 1000.0;
            this.limit.intensity = this.shocker.limits.intensity === null ? 100 : this.shocker.limits.intensity;
        },
        async saveChanges() {
            await apiCall.makeCall("PATCH", `1/shares/links/${this.$route.params.id}/${this.shocker.id}`, {
                permissions: {
                    sound: this.shocker.permissions.sound,
                    vibrate: this.shocker.permissions.vibrate,
                    shock: this.shocker.permissions.shock,
                },
                limits: {
                    duration: this.limit.duration == 30.0 ? null : this.limit.duration * 1000,
                    intensity: this.limit.intensity == 100 ? null : this.limit.intensity
                }
            });
            this.modified = false;
        },
        ellipsis(e) {
            this.$contextmenu({
                theme: utils.isDarkMode() ? 'default dark' : 'default',
                x: e.x,
                y: e.y,
                items: [
                    {
                        label: "Remove from Share Link",
                        icon: 'fa-solid fa-trash',
                        onClick: () => {
                            this.delete();
                        }
                    }
                ]
            });
        },
        delete() {
            this.$swal({
                title: 'Remove from ShareLink?',
                html: `You are about to remove the Shocker <b>${this.shocker.name}</b> [${this.shocker.id}] from this Share Link.<br>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: 'var(--secondary-seperator-color)',
                showLoaderOnConfirm: true,
                confirmButtonText: 'Remove',
                allowOutsideClick: () => !this.$swal.isLoading(),
                preConfirm: async () => {
                    try {
                        const res = await apiCall.makeCall('DELETE', `1/shares/links/${this.$route.params.id}/${this.shocker.id}`);
                        if (res.status !== 200) {
                            throw new Error(res.statusText);
                        }

                    } catch (err) {
                        this.$swal.showValidationMessage(`Request failed: ${err}`)
                    }
                },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    this.$swal('Success!', 'Successfully removed Shocker from Share Link', 'success');
                    this.emitter.emit('refreshShareLink');
                }
            });
        },
        async togglePause() {
            const toSet = !this.pausedOnShareLinkLevel;
            const res = await apiCall.makeCall("POST", `1/shares/links/${this.$route.params.id}/${this.shocker.id}/pause`, {
                pause: toSet
            });

            if (res === undefined || res.status !== 200) {
                toastr.error("Error while updating pause state");
                return;
            }

            this.shocker.paused = res.data.data;
        }
    },
    computed: {
        pausedOnShareLinkLevel() {
            return this.shocker.paused & PR.SHARE_LINK;
        },
    },
    watch: {
        'limit.duration'(newValue, oldValue) {
            if (oldValue !== null) this.modified = true;
        },
        'limit.intensity'(newValue, oldValue) {
            if (oldValue !== null) this.modified = true;
        },
        'shocker.permissions.shock'(newValue, oldValue) {
            if (oldValue !== null) this.modified = true;
        },
        'shocker.permissions.vibrate'(newValue, oldValue) {
            if (oldValue !== null) this.modified = true;
        },
        'shocker.permissions.sound'(newValue, oldValue) {
            if (oldValue !== null) this.modified = true;
        },
    }
}
</script>

<style scoped lang="scss">
.shocker {
    background-color: var(--secondary-background-color);
    border: solid var(--main-seperator-color) 1px;
    border-radius: 10px;
    margin: 10px 0;
    padding: 10px;
    position: relative;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;

    .save-button {
        position: absolute;
        width: 40px;
        height: 40px;
        right: 25px;
        bottom: 10px;

        button {
            margin-top: 0;
        }
    }

    .head {
        border-bottom: solid 2px var(--main-background-color);
        padding-bottom: 10px !important;
        margin-left: -10px;
        margin-right: -10px;

        .pause-col {
            cursor: pointer;
            padding-left: 4px;
            padding-right: 4px;
            width: 20px;

            .paused {
                color: rgb(255, 86, 86);
            }
        }

        .shocker-name-col {
            margin-right: auto;
            width: calc(100% - 50px);
            padding-left: 8px;

            .shocker-name {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                margin-bottom: 0;
            }
        }
    }

    .row {
        padding: 0 12px;

        .form-range {
            padding: 0 12px;
        }
    }
}
</style>