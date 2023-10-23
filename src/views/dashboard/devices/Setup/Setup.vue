<template>
    <div class="base-wrap">
        <b-container>
            <b-row align-h="center">
                <b-col md="auto">
                    <h3>ESP-32 setup assistant</h3>
                </b-col>
            </b-row>
            <br>
            <serial-flash></serial-flash>

        </b-container>
    </div>
</template>
  
<script>
import Loading from '../../../utils/Loading';
import Page1 from './Page1';
import Page2 from './Page2';
import SerialFlash from './SerialFlash';

export default {
    components: { Loading, Page1, Page2, SerialFlash },
    data() {
        return {
            page: 1,
            device: undefined,
            networks: [
                {
                    ssid: "yes",
                    password: "aaa"
                }
            ]
        }
    },
    mounted() {
        this.$store.dispatch('setNewNav', []);
        this.emitter.on("setup-serialConnect", () => {
            this.serialConnect();
        });
    },
    async beforeMount() {
        await this.loadDevice();
    },
    methods: {
        async loadDevice() {
            const res = await apiCall.makeCall('GET', '1/devices/' + this.$route.params.id);
            if (res === undefined || res.status !== 200) {
                toastr.error("Error while retrieving device details");
                return;
            }

            this.device = res.data.data;
        },
        formatMacAddr(macAddr) {
            return macAddr.map((value) => value.toString(16).toUpperCase().padStart(2, "0")).join(":");
        }
    },
    computed: {
        supported() {
            return ('serial' in navigator)
        }
    }
}
</script>
  
<style scoped lang="scss">
:deep(.action-header-td) {
    display: table-cell;
    vertical-align: middle;
}

:deep(.actions-header) {
    width: 0px;
}

.network-table {
    .mr {
        margin-right: 10px;

        --bs-btn-color: #fff;
        --bs-btn-hover-color: #fff;
        --bs-btn-active-color: #fff;
    }
}
</style>