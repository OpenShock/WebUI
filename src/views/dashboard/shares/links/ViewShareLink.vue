<template>
    <div v-if="shareLink != null">
        <b-container>
            <b-row>
                <b-col>
                    <h3>{{ this.shareLink.name }}</h3>
                </b-col>
                <b-col cols="auto" class="elli" @click="ellipsis">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </b-col>
            </b-row>
            <b-row v-if="editMode">
                <b-col v-for="item in shareLink.shockers" :key="item.id" class="shocker-col">
                    <share-link-shocker-edit :shocker="item"></share-link-shocker-edit>
                </b-col>
                <b-col class="basic-card selectable sharelink-card add-new" @click="openAddShockerModal">
                    <b-row>
                        <h3 style="margin-bottom: 65px;">Add shocker</h3>
                        <i class="fa-solid fa-plus"></i>
                    </b-row>
                </b-col>
            </b-row>
            <b-row v-else>
                <b-col v-for="item in shareLink.shockers" :key="item.id" class="shocker-col">
                    <share-link-shocker :shocker="item"></share-link-shocker>
                </b-col>
            </b-row>
        </b-container>
    </div>

    <b-modal v-model="addShocker.modal" title="Add Shocker" ok-title="Add" @ok.prevent="addShockerAction">
        <loading v-if="addShocker.ownShockersLoading"></loading>
        <div v-else>
            <b-container style="padding: 0;">
                <b-form-group label="Shocker" label-for="shocker">
                    <b-form-select :state="validateAddShocker" id="shocker" v-model="addShocker.selectedShocker"
                        :options="addShockerList" required />
                    <b-form-invalid-feedback :state="validateAddShocker">
                        Select a shocker
                    </b-form-invalid-feedback>
                </b-form-group>
            </b-container>
        </div>
    </b-modal>
</template>

<script>
import ShareLinkShocker from "./ShareLinkShocker.vue"
import ShareLinkShockerEdit from './edit/ShareLinkShockerEdit.vue';

export default {
    components: { ShareLinkShocker, ShareLinkShockerEdit },
    props: ['id'],
    data() {
        return {
            shareLink: undefined,
            editMode: true,
            ownShockers: [],
            addShocker: {
                modal: false,
                ownShockersLoading: true,
                ownShockers: [],
                selectedShocker: undefined
            }
        }
    },
    async beforeMount() {
        await this.loadShareLink();
        this.emitter.on('refreshShareLink', async () => {
            await this.loadShareLink();
        });
    },
    methods: {
        async loadShareLink() {
            const res = await apiCall.makeCall("GET", "1/shares/links/" + this.id);
            if (res === undefined || res.status !== 200) {
                toastr.error("Error while loading Share Link");
                return;
            }
            this.shareLink = res.data.data;
            this.shareLink.shockers.forEach(shocker => {
                shocker.state = {
                    intensity: 25,
                    duration: 1
                }
            });
        },
        async loadAllOwnShockers() {
            this.addShocker.ownShockersLoading = true;
            const res = await apiCall.makeCall('GET', '1/shockers/own');
            if (res === undefined || res.status !== 200) {
                toastr.error("Error while retrieving own shockers");
                return;
            }

            this.addShocker.ownShockers = res.data.data;
            this.addShocker.ownShockersLoading = false;
        },
        async openAddShockerModal() {
            this.loadAllOwnShockers();
            this.addShocker.modal = true;
        },
        async addShockerAction() {
            if (!this.validateAddShocker) return;
            const res = await apiCall.makeCall('POST', `1/shares/links/${this.id}/${this.addShocker.selectedShocker}`);
            if (res === undefined || res.status !== 200) {
                toastr.error("Error while adding shocker to share link");
                return;
            }

            this.loadShareLink();
            this.addShocker.modal = false;
            this.$swal('Successfully added Shocker to Share Link!', '', 'success');
        },
        deleteShareLink() {
            this.$swal({
                title: 'Delete Share Link?',
                html: `You are about to delete Share Link:<br><b>${this.shareLink.name}</b><br><br>
                    This action is permanent and cannot be undone.
                    <br><br>Are you sure?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: 'var(--secondary-seperator-color)',
                showLoaderOnConfirm: true,
                confirmButtonText: 'Delete Share Link',
                allowOutsideClick: () => !this.$swal.isLoading(),
                preConfirm: async () => {
                    try {
                        const res = await apiCall.makeCall('DELETE', `1/shares/links/${this.id}`);
                        if (res.status !== 200) {
                            throw new Error(res);
                        }

                    } catch (err) {
                        this.$swal.showValidationMessage(`Request failed: ${utils.getError(err)}`)
                    }
                },
            }).then(async (result) => {
                if (result.isConfirmed) {
                    this.$swal('Success!', 'Successfully deleted Share Link', 'success');
                    this.$router.push('/dashboard/shares/links');
                }
            });
        },
        ellipsis(e) {
            this.$contextmenu({
                theme: utils.isDarkMode() ? 'default dark' : 'default',
                x: e.x,
                y: e.y,
                items: [
                    {
                        label: "Edit Mode",
                        icon: this.editMode ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off',
                        onClick: () => {
                            this.editMode = !this.editMode;
                        }
                    },
                    {
                        label: "Remove",
                        icon: 'fa-solid fa-trash',
                        onClick: () => {
                            this.deleteShareLink();
                        }
                    }
                ]
            });
        },
    },
    computed: {
        validateAddShocker() {
            return this.addShocker.selectedShocker !== undefined && this.addShocker.selectedShocker !== "";
        },
        addShockerList() {
            var arr = [];
            this.addShocker.ownShockers.forEach(it => {
                it.shockers.forEach(it2 => {
                    arr.push({
                        text: it2.name,
                        value: it2.id
                    });
                });
            });
            return arr;
        },
    }
}
</script>

<style scoped lang="scss">
.shocker-col {
    @media screen and (min-width: 440px) {
        min-width: 440px;
    }
    
}

.elli {
    //margin-right: 25px;
}

.sharelink-card {
    max-width: 224px;
    min-width: 224px;
    height: 300px;
    text-align: center;
    padding: 10px;
    padding-top: 20px;
    margin: 20px;
    overflow-wrap: anywhere;

    .copy-clip {
        font-size: 30px;
        padding: 0;
        margin: 0;
        border-radius: 15px;

        .backdrop {

            margin: auto;
            width: 70px;
            height: 70px;
            padding: 15px;
            border-radius: 15px;
            transition: ease-in-out 0.2s background-color;

            &:hover {
                background-color: var(--main-background-color);
            }


            svg {
                margin: auto;
                width: 40px;
                height: 40px;
            }
        }
    }

    &.add-new {
        background-color: var(--main-blackground-dark);

        svg {
            padding: 0;
            font-size: 50px;
        }
    }
}
</style>