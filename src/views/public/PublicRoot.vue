<template>
  <router-view v-slot="{ Component }">
    <transition name="component-fade" mode="out-in">
      <div :key="'0'" id="app-root" class="public-root">
        <public-nav-root></public-nav-root>

        <div class="public-wrap">
          <transition name="component-fade" mode="out-in">
            <component :is="Component"></component>
          </transition>
        </div>
      </div>
    </transition>
  </router-view>
</template>
  
<script>
import PublicNavRoot from './nav/PublicNavRoot.vue'

export default {
  components: { PublicNavRoot },
  mounted() {

  },
  data() {
    return {

    }
  },
  computed: {

  },
  methods: {

  }
}
</script>
  
<style lang="scss">
.public-wrap {
  padding: 25px 35px;
}
</style>
  