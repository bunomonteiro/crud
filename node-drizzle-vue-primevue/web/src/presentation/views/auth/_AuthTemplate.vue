
<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="content grid grid-nogutter">
    <div class="left overflow-hidden hidden md:block md:col-6 lg:col-8">
      <div class="bg-cover bg-center h-full w-full" style="background-image: url('/images/signin_cover.jpg');"></div>
    </div>

    <div class="right col-12 md:col-6 lg:col-4 overflow-auto">
      <router-view />
    </div>
  </main>
</template>
