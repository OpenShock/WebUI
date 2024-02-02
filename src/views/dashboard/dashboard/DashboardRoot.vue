<template>
  <div class="base-wrap">
    <b-container>
      <b-row align-h="center">

        <b-col class="root" @click="clickDiscord">
          <i class="fa-brands fa-discord icon"></i>
          <h3>Discord</h3>
        </b-col>

        <b-col class="root" @click="clickDocs">
          <i class="fa-solid fa-book icon"></i>
          <h3>Docs</h3>
        </b-col>

        <b-col class="root" @click="clickGithub">
          <i class="fa-brands fa-github icon"></i>
          <h3>GitHub</h3>
        </b-col>

      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$store.dispatch('setNewNav', []);
  },
  methods: {
    clickDiscord() {
      window.open('https://discord.gg/OpenShock', '_blank')
    },
    clickDocs() {
      window.open('https://wiki.openshock.org', '_blank')
    },
    clickGithub() {
      window.open('https://github.com/OpenShock', '_blank')
    },
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
  padding: 30px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 10px;
  min-width: 200px;
  max-width: 275px;

  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  .icon {
    font-size: 50px;
  }

  &:hover {
    background-color: var(--secondary-background-color);
  }
}
</style>