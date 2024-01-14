<template>
    <div class="root" :class="{disabled: retrievedVersion === null}" @click="clicked">
        <h3>{{ label }}</h3>
        {{ version }}
    </div>
</template>

<script>
import axios from 'axios';

export default {
    props: ['branch', 'label'],
    data() {
        return {
            retrievedVersion: null,
            error: null
        }
    },
    mounted() {
        this.getVersion();
    },
    methods: {
        clicked() {
            if(this.retrievedVersion === null) return;
            this.$emit('clicked', this.branch, this.retrievedVersion);
        },
        async getVersion() {
            var response = null;

            try {
                response = await axios({
                    method: 'GET',
                    url: `https://firmware.openshock.org/version-${this.branch}.txt`,
                    withCredentials: false
                });
            } catch (error) {
                console.log(error);
                this.error = true;
                return;
            }

            if (response.status != 200) {
                console.log(`Failed to get version`);
                console.log(`Response code was: ${response.status}`);
                this.error = true;
                return;
            }

            const ver = response.data.trim();

            console.log(`> ${this.branch} = ${ver}`);

            this.retrievedVersion = ver;
        }
    },
    computed: {
        version() {
            if (this.error !== null) return "Error";
            return this.retrievedVersion ?? "Loading...";
        }
    }
}
</script>

<style scoped lang="scss">
.root {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 10px;
    min-width: 200px;
    min-height: 200px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    transition: all 0.2s ease-in-out;
    cursor: pointer;

    &:hover {
        background-color: var(--secondary-background-color);
    }


    &.disabled {
        opacity: 0.5;
        pointer-events: none;
    }

}
</style>