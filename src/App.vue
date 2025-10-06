<!-- src/App.vue -->
<script setup lang="ts">

</script>

<template>
  <div id="app">    
    <Toast />
    <ConfirmDialog />
    <RouterView />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  background-color: var(--bg-primary);
}
</style>