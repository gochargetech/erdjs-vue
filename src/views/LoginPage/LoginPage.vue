<template>
  <div class="d-flex flex-column flex-grow-1">
    <div class="d-flex flex-fill align-items-center container">
      <div class="row w-100">
        <ErdjsLogin />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  computed: {
    isLoggedIn() {
      return this.$erdjs.getDapp().getLoginInfoStore().isLoggedIn;
    },
  },
  mounted() {
    const to = this.$route.query.to;
    if (this.isLoggedIn && to) {
      this.$router.push(`${to}`);
    }
  },
};
</script>
