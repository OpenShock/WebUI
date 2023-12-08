<template>
    <b-container>
        <b-row>
            <h4>Online Devices: <b>{{ devices.length }}</b></h4>
        </b-row>
        <b-row>
        <b-table hover striped :items="devices" :fields="fields" class="devices-table">
            <template #cell(owner)="row">
                    <b-container>
                        <b-row align-h="start" align-v="center">
                            <b-col md="auto">
                                <img class="user-image" :src="row.item.owner.image + '&s=128'" />
                            </b-col>
                            <b-col>
                                <p class="mb-0">{{ row.item.owner.name }}</p>
                            </b-col>
                        </b-row>
                    </b-container>
                </template>
        </b-table>
        </b-row>
    </b-container>
</template>

<script>
export default {
    data() {
        return {
            devices: [],
            fields: [
                {
                    key: "id",
                    label: "ID"
                },
                {
                    key: "name"
                },
                {
                    key: "firmwareVersion"
                },
                {
                    key: "gateway"
                },
                {
                    key: 'owner'
                }
            ],
        }
    },
    beforeMount() {
        this.getOnlineDevices();
    },
    methods: {
        async getOnlineDevices() {
            const res = await apiCall.makeCall('GET', '1/admin/monitoring/onlineDevices');

            this.devices = res.data.data;
        }
    }
}
</script>


<style lang="scss" scoped>

.devices-table {
    .mr {
        margin-right: 10px;

        --bs-btn-color: #fff;
        --bs-btn-hover-color: #fff;
        --bs-btn-active-color: #fff;
    }

    :deep(td) {
        vertical-align: middle;
    }
}
</style>
