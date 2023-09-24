<template>
  <b-container class="row-spacer">
    <b-row class="base-widget">
      <b-container>
        <h4>General Account Information</h4>
        <b-row class="my-1">
          <b-col sm="2">
            <label for="id">User ID:</label>
          </b-col>
          <b-col sm="10">
            <b-form-input id="id" plaintext v-model="user.id"></b-form-input>
          </b-col>
        </b-row>

        <b-row class="my-1">
          <b-col sm="2">
            <label for="username">Username:</label>
          </b-col>
          <b-col sm="10">
            <b-form-input id="username" plaintext v-model="user.name"></b-form-input>
          </b-col>
        </b-row>

        <b-row class="my-1">
          <b-col sm="2">
            <label for="email">Email:</label>
          </b-col>
          <b-col sm="10">
            <b-form-input id="email" plaintext v-model="user.email"></b-form-input>
          </b-col>
        </b-row>
      </b-container>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios';
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';
import LoadingWithText from '../../utils/LoadingWithText.vue';

export default {
  components: { VueCropper, LoadingWithText },
  data() {
    return {
    }
  },
  methods: {
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  }
}
</script>

<style lang="scss">

.my-1 {
  .col-sm-2 {
    align-self: center;
  }
}
</style>
