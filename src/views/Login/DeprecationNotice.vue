<template>
  <div class="login100-form deprecation-notice">
    <span class="login100-form-title">Moved</span>

    <p class="deprecation-text">
      This legacy Web UI is <b>deprecated</b> and no longer maintained.
    </p>
    <p class="deprecation-text">
      Logging in, signing up and account management now happen on the new OpenShock frontend.
    </p>

    <div class="container-login100-form-btn">
      <div class="wrap-login100-form-btn">
        <div class="login100-form-bgbtn"></div>
        <a href="https://openshock.app" class="login100-form-btn">Go to openshock.app</a>
      </div>
    </div>

    <p class="deprecation-text selfhost">
      Selfhosting? Migrate to <a href="https://github.com/openshock/frontend" target="_blank">the new Frontend</a>.
    </p>
  </div>
</template>

<script>
export default {
  name: "DeprecationNotice"
}
</script>

<style scoped>
.deprecation-notice {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.deprecation-text {
  font-family: Poppins, sans-serif;
  font-size: 16px;
  color: #fff;
  line-height: 1.6;
  margin-bottom: 25px;
}

.deprecation-text.selfhost {
  margin-top: 30px;
  font-size: 14px;
}

.deprecation-text a {
  color: #fff;
  font-weight: 700;
  text-decoration: underline;
}

.deprecation-notice .login100-form-btn {
  text-decoration: none;
}
</style>
