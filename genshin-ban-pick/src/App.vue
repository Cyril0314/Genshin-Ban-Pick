<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import { createLogger } from './app/utils/logger';
import { naiveThemeOverrides } from './app/theme/naiveThemeOverrides';

const logger = createLogger('app.ui');

onMounted(() => {
  logger.info('mounted')
})

</script>

<template>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->

  <n-config-provider :theme-overrides="naiveThemeOverrides">
    <div id="app">
      <RouterView />
    </div>
  </n-config-provider>
</template>

<style scoped>
#app {}

/* 
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
} */
</style>
