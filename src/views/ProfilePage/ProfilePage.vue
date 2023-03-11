<template>
  <div class="d-flex flex-column flex-grow-1">
    <div class="d-flex flex-fill align-items-center container">
      <div class="row w-100">
        <div class="col-12 col-md-8 mx-auto">
          <div class="card shadow-sm rounded p-4 border-0">
            <div class="card-body text-center">
              <h3>PRIVATE</h3>
              <p>auth: {{ isLoggedIn }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfilePage",
  computed: {
    isLoggedIn() {
      return this.$erdjs.getDapp().getLoginInfoStore().isLoggedIn;
    },
  },
};
</script>
