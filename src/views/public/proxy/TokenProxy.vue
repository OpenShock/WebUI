<template>
    <div class="base-wrap">
        <b-container class="token-create">
            <b-row align-h="center">
                <b-col md="auto">
                    <h1>API Token Request</h1>
                </b-col>
            </b-row>
            <br />
            <div style="text-align: center;" v-if="error">
                <h1>Invalid Request</h1>
                <p>Make sure `name`, `redirect_uri` and `permissions` are set as get parameters</p>
            </div>
            <div v-else-if="loading">
                <loading v-if="loading"></loading>
            </div>
            <div v-else-if="redirectedUri !== null">
                <b-row style="text-align: center;" align-h="center">
                    <b-col md="auto">
                        <h2>Success!</h2>
                        <h5>You can now return to {{ name }}</h5>
                        <br/>
                        <br/>
                        <b-button @click="redirectToUri">Open URI again</b-button>
                    </b-col>
                </b-row>
            </div>
            <div v-else>
                <b-row style="text-align: center;" align-h="center">
                    <b-col md="auto">
                        <h5>{{ name }} is requesting access<br>to your account.</h5>
                    </b-col>
                </b-row>
                <br />
                <b-row>
                    <b-col>
                        <p>Permissions:</p>
                        <ul>
                            <li v-for="permission in permissions" :key="permission">{{ permission }}</li>
                        </ul>
                    </b-col>
                </b-row>

                <br />

                <b-row style="text-align: center;" align-h="center">
                    <b-col md="auto">
                        <h6>You will be redirected to <span class="redirect-backdrop">{{ redirectUri
                                }}</span><br />which should be a part of {{ name }}<br /><br /></h6>
                                <p>Your new API Token will be shared with the application at this address.<br />
                            Are you sure you want to proceed?</p>
                    </b-col>
                </b-row>
                <br />
                <b-row align-h="center">
                    <b-col md="auto">
                        <loading-button @click="proceed" :loading="loadingProceed" text="Continue"></loading-button>
                    </b-col>
                </b-row>
            </div>

        </b-container>
    </div>
</template>

<script>
import LoadingButton from '../../utils/LoadingButton.vue';
import Loading from '../../utils/Loading.vue';

export default {
  components: { LoadingButton, Loading },
    data() {
        return {
            name: null,
            redirectUri: null,
            permissions: null,
            loading: true,
            error: false,
            loadingProceed: false,
            redirectedUri: null
        }
    },
    async beforeMount() {
        // Read get params
        this.name = this.$route.query.name;
        this.redirectUri = this.$route.query.redirect_uri;
        this.permissions = this.$route.query.permissions.split(',');

        if (!this.name || !this.redirectUri || !this.permissions || !this.permissions.length) {
            this.error = true;
            return;
        }

        this.loading = true;
        var loggedIn = await utils.checkIfLoggedIn();
        this.loading = false;

        if (!loggedIn) {
            this.login();
            return;
        }
    },
    methods: {
        login() {
            this.$store.dispatch('setReturnUrl', "/public/proxy/token/?redirect_uri=" + this.redirectUri + "&permissions=" + this.permissions);
            this.$router.push("/account/login");
        },
        async proceed() {
            if(this.loadingProceed) return;
            this.loadingProceed = true;

            const res = await apiCall.makeCall('POST', `1/tokens`, {
                name: this.name,
                validUntil: null,
                permissions: this.permissions
            });
            if (res === undefined || res.status !== 200) {
                this.$swal('Error', 'Error while adding new token', 'error');
                return;
            }

            this.redirectedUri = this.redirectUri.replace("%", res.data.token);
            this.redirectToUri();
            this.loadingProceed = false;
        },
        redirectToUri() {
            window.location = this.redirectedUri;
        }
    }

}
</script>

<style scoped>
.redirect-backdrop {
    background-color: var(--main-text-hover-color);
    padding: 0 5px;
    border-radius: 5px;
    color: var(--invert-color);
}

.token-create {
    max-width: 800px;
    width: 500px;
    min-height: 600px;
    border: 1px solid var(--main-text-hover-color);
    border-radius: 15px;
    padding: 20px;
    background-color: var(--secondary-background-color);
}
</style>