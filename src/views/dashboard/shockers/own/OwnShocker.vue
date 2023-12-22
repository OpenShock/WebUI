<template>
    <b-container class="shocker">
        <b-row class="head">
            <b-col cols="auto" class="pause-col" @click="togglePause">
                <span v-if="shocker.isPaused" class="paused">
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
        <div class="content-container">
            <div v-if="shocker.isPaused" class="paused-text width100">
                <b-container class="width100">
                    <b-row align-h="center">
                        <b-col cols="auto">
                            <h2>Paused</h2>
                        </b-col>
                        <b-col cols="auto" @click="togglePause" style="cursor: pointer;">
                            <i style="font-size: 38px;" class="fa-solid fa-play"></i>
                        </b-col>
                    </b-row>
                </b-container>
            </div>
            <div class="content-child" :class="shocker.isPaused ? 'paused' : ''">
                <b-row>
                    <b-container align-items="center" style="margin-top: 15px">
                        <b-row align-h="center">
                            <b-col md="auto" style="width: unset">
                                <round-slider v-model="shocker.state.intensity" pathColor="#1b1d1e" rangeColor="#e14a6d"
                                    start-angle="315" end-angle="+270" width="30" line-cap="round" radius="75" />

                                <p style="text-align: center;">Intensity</p>
                            </b-col>
                            <b-col md="auto" style="width: unset">
                                <round-slider v-model="shocker.state.duration" pathColor="#1b1d1e" rangeColor="#e14a6d"
                                    start-angle="315" end-angle="+270" line-cap="round" radius="75" width="30" min="0.3"
                                    max="30" step="0.1" />

                                <p style="text-align: center;">Duration</p>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-row>
                <b-row v-if="delay.controlsDisabled" align-h="center">
                    <b-col md="auto">
                        <b-button id="delayed-actions-button" variant="nano" @click="cancelDelayed">Delayed actions in {{ this.delay.timeRemaining }}s</b-button>
                        <b-tooltip target="delayed-actions-button" triggers="hover">
                            Click to cancel
                        </b-tooltip>
                    </b-col>
                </b-row>
                <b-row v-else align-h="center">
                    <b-col cols="auto" md="auto">
                        <control-button style="width: 46px" text="" icon="fa-solid fa-volume-high"
                            loadingIcon="fa-solid fa-spinner fa-spin" :loading="inProgress" @click="control(3)" />
                    </b-col>
                    <b-col cols="auto" md="auto">
                        <control-button style="width: 46px" text="" icon="fa-solid fa-water"
                            loadingIcon="fa-solid fa-spinner fa-spin" :loading="inProgress" @click="control(2)" />
                    </b-col>
                    <b-col cols="auto" md="auto">
                        <control-button style="left: 0; width: 46px" text="" icon="fa-solid fa-bolt"
                            loadingIcon="fa-solid fa-spinner fa-spin" :loading="inProgress" @click="control(1)" />
                    </b-col>
                </b-row>

                <b-row class="random-slider">
                    <b-col cols="1">
                        <BFormCheckbox v-model="delay.randomSliderWarning" id="random-slider-warning-checkbox">
                        </BFormCheckbox>
                        <b-tooltip target="random-slider-warning-checkbox" triggers="hover">
                            Send a warning (vibrate) before sending a shock<br>
                            (Set slider to 0 to disable delay)
                        </b-tooltip>
                    </b-col>
                    <b-col>
                        <Slider v-model="delay.randomSliderValue" style="margin-top: 10px" :step=0.3 :min=0 :max=5
                            :format="formatTooltipSlider" showTooltip="focus" />
                    </b-col>
                </b-row>
            </div>
        </div>
    </b-container>
</template>

<script>
import Loading from '../../../utils/Loading.vue';
import RoundSlider from 'vue-three-round-slider';
import ControlButton from '../../../utils/ControlButton.vue';
import Slider from '@vueform/slider';


export default {
    components: { Loading, RoundSlider, ControlButton, Slider },

    props: ["shocker"],
    data() {
        return {
            inProgress: false,
            sliderValue: 0,
            lastTimeout: null,

            delay: {
                randomSliderWarning: false,
                randomSliderValue: [0, 0],
                timeout: null,
                controlsDisabled: false,
                timeRemaining: 0,
                in: 0
            }
        }
    },
    beforeMount() {

    },
    methods: {
        formatTooltipSlider(value) {
            return value;
        },
        ellipsis(e) {
            this.$contextmenu({
                theme: utils.isDarkMode() ? 'default dark' : 'default',
                x: e.x,
                y: e.y,
                items: [
                    {
                        label: "Shares",
                        icon: 'fa-solid fa-share-nodes',
                        onClick: () => {
                            this.$router.push(`/dashboard/shockers/${this.shocker.id}/shares`);
                        }
                    },
                    {
                        label: "Logs",
                        icon: 'fa-solid fa-list',
                        onClick: () => {
                            this.$router.push(`/dashboard/shockers/${this.shocker.id}/logs`);
                        }
                    },
                    {
                        label: "Edit",
                        icon: 'fa-solid fa-pen-to-square',
                        onClick: () => {
                            this.emitter.emit('editShocker', this.shocker.id);
                        }
                    },
                    {
                        label: "Remove",
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
                title: 'Delete?',
                html: `You are about to delete the shocker <b>${this.shocker.name}</b> with id (${this.shocker.id}).<br>This will also delete <b>all shares associated with that shocker.</b>
                    <br><br><b><u>This is permanent and cannot be undone.</u></b><br>Are you sure?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: 'var(--secondary-seperator-color)',
                showLoaderOnConfirm: true,
                confirmButtonText: 'Delete shocker',
                allowOutsideClick: () => !this.$swal.isLoading(),
                preConfirm: async () => {
                    try {
                        const res = await apiCall.makeCall('DELETE', `1/shockers/${this.shocker.id}`);
                        if (res.status !== 200) {
                            throw new Error(res.statusText);
                        }

                    } catch (err) {
                        this.$swal.showValidationMessage(`Request failed: ${err}`)
                    }
                },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    this.$swal('Success!', 'Successfully deleted shocker', 'success');
                    this.emitter.emit('refreshShockers');
                }
            });
        },
        getRandomValueWithStep(start, end, step) {
            const randomValue = Math.floor(Math.random() * ((end - start) / step + 1)) * step + start;
            return randomValue.toFixed(1); // Rounds to one decimal place
        },
        cancelDelayed() {
            if (this.delay.timeout !== null) {
                clearTimeout(this.delay.timeout);
                this.delay.timeout = null;
            }

            this.delay.controlsDisabled = false;  
        },
        delayCountDown() {
            this.delay.timeRemaining = (Math.max(0, (this.delay.in - Date.now())) / 1000).toFixed(1);

            if (this.delay.timeRemaining <= 0) {
                this.delay.controlsDisabled = false;
                return;
            }

            setTimeout(() => this.delayCountDown(), 100);
        },
        async control(type) {
            const min = this.delay.randomSliderValue[0];
            const max = this.delay.randomSliderValue[1];

            const intensity = parseInt(this.shocker.state.intensity);
            const duration = parseFloat(this.shocker.state.duration) * 1000;

            if (min !== 0 || max !== 0) {
                if (this.delay.timeout !== null) {
                    clearTimeout(this.delay.timeout);
                    this.delay.timeout = null;
                }

                var random = this.getRandomValueWithStep(min, max, 0.1);
                this.delay.in = Date.now() + random * 1000;
                this.delayCountDown();
                this.delay.controlsDisabled = true;

                if (this.delay.randomSliderWarning) {
                    // Vibrate for half a second
                    await ws.control(
                        this.shocker.id,
                        parseInt(this.shocker.state.intensity),
                        500,
                        2
                    );
                }

                this.delay.timeout = setTimeout(() => this.internalControl(type, intensity, duration), random * 1000)
                return;
            }

            await this.internalControl(type, intensity, duration)
        },
        async internalControl(type, intensity, duration) {
            if (this.lastTimeout !== null) {
                clearTimeout(this.lastTimeout);
                this.lastTimeout = null;
            }

            this.delay.controlsDisabled = false;

            await ws.control(
                this.shocker.id,
                intensity,
                duration,
                this.inProgress ? 0 : type
            );

            if (this.inProgress) {
                this.inProgress = false;
                return;
            }
            this.inProgress = true;

            this.lastTimeout = setTimeout(() => this.inProgress = false, duration);
        },
        async togglePause() {
            const toSet = !this.shocker.isPaused;
            await apiCall.makeCall("POST", `1/shockers/${this.shocker.id}/pause`, {
                pause: toSet
            });

            this.shocker.isPaused = toSet;
        }
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
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;

    .delay-text {
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-weight: 500;
        line-height: 1.2;
        color: var(--bs-heading-color);
        font-size: 1.25rem;
    }

    .random-slider {
        margin-top: 20px;
        margin-bottom: 10px;
    }

    .content-container {
        position: relative;

        transition: 1s filter linear, 1s -webkit-filter linear;

        .paused-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
        }

        .content-child {
            transition: filter 0.3s ease-in-out;
            filter: blur(0px);
        }

        .paused {
            pointer-events: none;
            filter: blur(5px);
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