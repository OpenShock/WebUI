<template>
  <form class="login100-form">
    <span class="login100-form-title">Login</span>

    <div class="moved-notice">
      <p><b>Login has moved.</b></p>
      <p>OpenShock has a new website. Please head over there to sign in.</p>
      <p>Once you're signed in you can come straight back here and keep using this site.</p>

      <div class="container-login100-form-btn">
        <div class="wrap-login100-form-btn">
          <div class="login100-form-bgbtn"></div>
          <a :href="newFrontendUrl" class="login100-form-btn">Continue to OpenShock</a>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
// The v1 account auth endpoints have been retired (OpenShock/API#322). Authentication
// now lives on the new OpenShock website, so this page redirects users there instead.
export default {
  data() {
    return {
      newFrontendUrl: 'https://openshock.app'
    }
  }
}
</script>

<style scoped>
.moved-notice {
  text-align: center;
}

.moved-notice p {
  color: #555;
  margin-bottom: 10px;
}

.moved-notice .container-login100-form-btn {
  margin-top: 30px;
}
</style>
