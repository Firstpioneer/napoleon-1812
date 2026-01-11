<template>
  <div id="napoleon-app">
    <router-view />
  </div>
</template>

<script setup>
</script>

<style>
#napoleon-app {
  width: 100%;
  min-height: 100vh;
}

.scroll-container {
  position: relative;
  z-index: 10;
  pointer-events: none;
}

.scroll-container > * {
  pointer-events: auto;
}

.chapter {
  pointer-events: auto;
}
</style>
