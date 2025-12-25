<template>
  <div class="app-container theme-five">
    <AppHeader />
    <div class="main-content">
      <!-- Focus sink lives OUTSIDE PrimeVue Menu -->
      <div
        id="focus-sink"
        tabindex="-1"
        class="sr-only"
        aria-hidden="true"
      >
        focus
      </div>

      <AppNavigation />
      <main class="content-area" role="main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
<style>
  .sr-only {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

</style>