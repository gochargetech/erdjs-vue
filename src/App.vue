<script setup lang="ts">

</script>

<template>
  <div class="bg-light d-flex flex-column flex-fill wrapper">
    <header>
      <nav class="bg-white border-bottom px-4 py-3 navbar navbar-expand navbar-light">
        <div class="container-fluid">
          <router-link :to="{name: 'home'}" class="d-flex align-items-center navbar-brand mr-0">Erdjs Vue</router-link>
          <div class="ml-auto navbar-nav">
            <router-link :to="{name: 'login'}" class="btn btn-primary">Account</router-link>
          </div>
        </div>
      </nav>
    </header>
    <main class="d-flex flex-column flex-grow-1">
      <router-view />
    </main>
    <footer>
      <ErdjsFooter />
      <div class="footer-text text-center p-2"><a href="https://github.com/gochargetech/erdjs-vue" target="_blank">erdjs-vue</a> built by <a href="https://gocharge.tech" target="_blank">goCharge.tech</a></div>
    </footer>
  </div>
</template>

<style scoped>
.footer-text{
  font-size: 12px;
}
</style>