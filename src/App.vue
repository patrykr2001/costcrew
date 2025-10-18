<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <h1 class="app-title">CostCrew - Dzielenie się opłatami</h1>
      <nav>
        <RouterLink to="/">Strona główna</RouterLink>
        <RouterLink to="/users">Użytkownicy</RouterLink>
        <RouterLink to="/groups">Grupy</RouterLink>
        <RouterLink to="/expenses">Wydatki</RouterLink>
        <RouterLink to="/balances">Sald i płatności</RouterLink>
        <RouterLink to="/about">O aplikacji</RouterLink>
      </nav>
    </div>
  </header>
  <main>
    <div class="main-content">
      <RouterView />
    </div>
  </main>
</template>

<style scoped>
header {
  background-color: #0b5fff;
  color: white;
  padding: 1.5rem 0 1rem 0;
  box-shadow: 0 2px 8px rgba(11, 95, 255, 0.08);
}

.wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.app-title {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: -1px;
}

nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

nav a {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.15s;
  font-weight: 500;
  font-size: 1rem;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.22);
}

nav a.router-link-active {
  background-color: rgba(255, 255, 255, 0.32);
  font-weight: 700;
}

main {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 2.5rem 0 2rem 0;
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 16px rgba(11, 95, 255, 0.06);
  min-height: 60vh;
}

@media (max-width: 900px) {
  .main-content {
    max-width: 100%;
    border-radius: 0.5rem;
    padding: 0 0.5rem;
  }
  .wrapper {
    padding: 0 0.5rem;
  }
}

@media (max-width: 600px) {
  .app-title {
    font-size: 1.2rem;
  }
  nav a {
    font-size: 0.95rem;
    padding: 0.5rem 0.7rem;
  }
  main {
    padding: 1rem 0 1rem 0;
  }
}
</style>
