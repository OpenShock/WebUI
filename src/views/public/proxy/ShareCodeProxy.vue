<template>
    <div class="proxy-container">
        <transition mode="out-in" name="component-fade">
            <checkmark v-if="!loading && error" error="true"></checkmark>
            <loading-with-text v-else-if="loading">Checking login status...</loading-with-text>
            <loading-with-text v-else>Redirecting...</loading-with-text>
        </transition>
    </div>
</template>

<script>
import Checkmark from '../../utils/Checkmark.vue';
import LoadingWithText from '../../utils/LoadingWithText.vue';

export default {
    components: { LoadingWithText, Checkmark },
    props: ['id'],
    data() {
        return {
            loading: true,
            error: true
        }
    },
    async beforeMount() {
        this.loading = true;
        var loggedIn = await utils.checkIfLoggedIn();
        this.loading = false;

        if (!loggedIn) {
            this.login();
            return;
        }

        try {
            const res = await apiCall.makeCall('POST', `1/shares/code/${this.id}`);
            if (res.status !== 200) {
                throw new Error(res.statusText);
            }
            toastr.success(`Failed to add share: ${utils.getError(err)}`);
        } catch (err) {
            this.error = true;
            toastr.error(`Failed to add share: ${utils.getError(err)}`);
            return;
        }

        this.redirectToShares();
    },
    methods: {
        redirectToShares() {
            this.$router.push("/dashboard/shockers/shared");
        },
        login() {
            this.$store.dispatch('setReturnUrl', "/proxy/shares/code/" + this.id);
            this.$router.push("/account/login");
        }
    }
}
</script>

<style scoped lang="scss"></style>
