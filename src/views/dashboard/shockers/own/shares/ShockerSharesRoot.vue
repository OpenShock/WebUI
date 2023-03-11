<template>
    <div>
        <div class="add-circle" @click="createNewCode">
            <i class="fa-solid fa-plus"></i>
        </div>

        <b-container>
            <b-table hover striped :items="shares" :fields="fields" class="shares-table">

                <template #cell(shared-with)="row">
                    <b-container>
                        <b-row align-h="start" align-v="center">
                            <b-col md="auto">
                                <img class="user-image" :src="row.item.sharedWith.image" />
                            </b-col>
                            <b-col>
                                <p class="user-name">{{ row.item.sharedWith.name }}</p>
                            </b-col>
                        </b-row>
                    </b-container>
                </template>

                <template #cell(permissions)="row">
                    <i class="perm fa-solid fa-volume-high"
                        :class="row.item.permissions.sound ? 'enabled' : 'disabled'"></i>
                    <i class="perm fa-solid fa-water" :class="row.item.permissions.vibrate ? 'enabled' : 'disabled'"></i>
                    <i class="perm fa-solid fa-bolt" :class="row.item.permissions.shock ? 'enabled' : 'disabled'"></i>
                </template>

                <template #cell(limits)="row">
                    <span>I: {{ row.item.limits.intensity }}</span>
                    <span>D: {{ row.item.limits.duration }}</span>
                </template>

                <template #cell(actions)="row">
                    <b-button size="sm" @click="editShare(row.item)" class="mr" variant="info">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </b-button>

                    <b-button size="sm" @click="removeShare(row.item)" class="mr" variant="danger">
                        <i class="fa-solid fa-trash"></i> Unshare
                    </b-button>
                </template>
            </b-table>
        </b-container>

        <b-container>
            <b-table hover striped :items="codes" :fields="fieldsCodes" class="share-codes-table">
                <template #cell(actions)="row">
                    <b-button size="sm" @click="removeCode(row.item)" class="mr" variant="danger">
                        <i class="fa-solid fa-trash"></i> Remove
                    </b-button>
                </template>
            </b-table>
        </b-container>

        <b-modal v-model="editModal" title="Edit Share" ok-title="Save" @ok.prevent="applyEdits">

            <b-container style="padding: 0;">
                <b-row align-h="start" align-v="center">
                    <b-col md="auto">
                        <img class="user-image" :src="editing.sharedWith.image" />
                    </b-col>
                    <b-col>
                        <p class="user-name">{{ editing.sharedWith.name }}</p>
                    </b-col>
                </b-row>


            </b-container>

        </b-modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            fields: [
                {
                    key: "shared-with",
                    label: "Shared With"
                },
                {
                    key: "permissions"
                },
                {
                    key: "limits"
                },
                {
                    key: 'actions',
                    thClass: "actions-header"
                }
            ],
            fieldsCodes: [
                {
                    key: "id",
                    label: "Code / Id"
                },
                {
                    key: "created",
                    label: "Created On"
                },
                {
                    key: 'actions',
                    thClass: "actions-header"
                }
            ],
            codes: [],
            shares: [],
            editModal: false,
            editing: {
                sharedWith: {
                    id: "",
                    name: "",
                    image: ""
                }
            }
        }
    },
    beforeMount() {
        this.loadShares();
        this.loadCodes();
    },
    methods: {
        async loadCodes() {
            const res = await apiCall.makeCall('GET', `1/shockers/${this.$route.params.id}/shareCodes`);
            if (res === undefined || res.status !== 200) {
                toastr.error("Error while retrieving shocker share codes");
                return;
            }

            this.codes = res.data.data;
        },
        removeCode(code) {
            this.$swal({
                title: 'Remove share code?',
                html: `Remove share code <b>${code.id}?</b>
                    <br><br>Are you sure?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: 'var(--secondary-seperator-color)',
                showLoaderOnConfirm: true,
                confirmButtonText: 'Remove share code',
                allowOutsideClick: () => !this.$swal.isLoading(),
                preConfirm: async () => {
                    try {
                        const res = await apiCall.makeCall('DELETE', `1/shares/code/${code.id}`);
                        if (res.status !== 200) {
                            throw new Error(res);
                        }

                    } catch (err) {
                        this.$swal.showValidationMessage(`Request failed: ${utils.getError(err)}`)
                    }
                },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    this.$swal('Success!', 'Successfully remove share code', 'success');
                    this.loadCodes();
                }
            });
        },
        async loadShares() {
            const res = await apiCall.makeCall('GET', `1/shockers/${this.$route.params.id}/shares`);
            if (res === undefined || res.status !== 200) {
                toastr.error("Error while retrieving shocker shares");
                return;
            }

            this.shares = res.data.data;
        },
        removeShare(share) {
            this.$swal({
                title: 'Unshare?',
                html: `Unshare shocker for <b>${share.sharedWith.name}</b>
                    <br><br>Are you sure?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: 'var(--secondary-seperator-color)',
                showLoaderOnConfirm: true,
                confirmButtonText: 'Unshare',
                allowOutsideClick: () => !this.$swal.isLoading(),
                preConfirm: async () => {
                    try {
                        const res = await apiCall.makeCall('DELETE', `1/shares/${this.$route.params.id}`);
                        if (res.status !== 200) {
                            throw new Error(res);
                        }

                    } catch (err) {
                        this.$swal.showValidationMessage(`Request failed: ${utils.getError(err)}`)
                    }
                },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    this.$swal('Success!', 'Successfully unshared shocker', 'success');
                    this.loadShares();
                }
            });
        },
        editShare(share) {
            this.editing = share;
            this.editModal = true;
        },
        applyEdits() {

        },
        async createNewCode() {
            const res = await apiCall.makeCall('POST', `1/shockers/${this.$route.params.id}/shares`, {
                permissions: {
                    vibrate: true,
                    shock: true,
                    sound: true
                },
                limits: {
                    duration: null,
                    intensity: null
                }
            });
            if (res === undefined || res.status !== 200) {
                toastr.error("Error while creating share code");
                return;
            }

            this.loadCodes();
            this.$swal('Successfully created share code!', `Code: ${res.data.data}`, 'success');
        }
    }
}
</script>

<style scoped lang="scss">
.breadcrum {
    color: #9e9e9e;
    font-size: 14px;
}

.user-image {
    height: 42px;
    width: 42px;
    padding: 0;
    border-radius: 50%;
}

.user-name {
    margin-bottom: 0;
}


.shares-table {
    .mr {
        margin-right: 10px;

        --bs-btn-color: #fff;
        --bs-btn-hover-color: #fff;
        --bs-btn-active-color: #fff;
    }

    :deep(.actions-header) {
        width: 350px;
    }

    :deep(td) {
        vertical-align: middle;
    }


    .perm {
        margin-right: 8%;

        &.enabled {
            color: greenyellow;
        }

        &.disabled {
            color: red;
        }
    }
}

.add-circle {
    position: fixed;
    right: 10px;
    bottom: 10px;
    width: 60px;
    height: 60px;


    background-color: #7ac142;
    border-radius: 50%;
    cursor: pointer;

    transition: background-color 0.2s;

    &:hover {
        background-color: #5e9634;
    }

    svg {
        height: 40px;
        width: 40px;

        position: relative;
        left: 52%;
        transform: translateX(-50%) translateY(-50%);
        top: 50%;

    }
}
</style>