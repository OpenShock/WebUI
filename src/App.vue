<template>
  <div class="deprecated-header">
    <p>⚠️ This legacy Web UI is <b>DEPRECATED</b> and no longer maintained. Please use the <a href="https://github.com/openshock/frontend" target="_blank">new Frontend</a>.</p>
  </div>
  <div v-if="dev" class="dev-header">
    <p>This is the OpenShock <b>DEVELOPMENT</b> environment. <u>No data is saved</u>, and regularly overwritten by production data</p>
  </div>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  beforeMount() {
    this.$store.commit('setDarkMode', utils.isDarkMode());
  },
  watch: {
    '$store.state.settings.dark'(val, old) {
      $('body').attr('data-color-scheme', val ? 'dark' : 'white');
    }
  },
  computed: {
    dev() {
      return config.dev === true || config.dev === 'true';
    }
  }
}
</script>

<style lang="scss">

.deprecated-header {
  top: 0;
  left: 0;
  right: 0;
  min-height: 25px;
  background-color: #b30000;
  color: #fff;
  text-align: center;
  z-index: 1000;
  line-height: 25px;

  p {
    margin-bottom: 0;
  }

  a {
    color: #fff;
    text-decoration: underline;
    font-weight: bold;
  }
}

.dev-header {
  top: 0;
  left: 0;
  right: 0;
  height: 25px;
  background-color: orangered;
  color: #fff;
  text-align: center;
  z-index: 999;
  line-height: 25px;
}

</style>