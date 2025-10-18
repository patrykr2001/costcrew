<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>Witaj w CostCrew!</h1>
      <p class="hero-subtitle">
        Aplikacja do łatwego dzielenia się opłatami ze znajomymi, rodziną i współpracownikami.
      </p>
    </div>

    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">👥</div>
        <h3>Zarządzanie użytkownikami</h3>
        <p>
          Dodawaj i zarządzaj użytkownikami w systemie. Każdy może mieć swój profil z imieniem i
          opcjonalnym emailem.
        </p>
        <RouterLink to="/users" class="btn btn-primary">Zarządzaj użytkownikami</RouterLink>
      </div>

      <div class="feature-card">
        <div class="feature-icon">🏠</div>
        <h3>Tworzenie grup</h3>
        <p>
          Twórz grupy dla różnych okazji - wyjazdy, mieszkanie, projekty. Dodawaj członków do grup.
        </p>
        <RouterLink to="/groups" class="btn btn-primary">Zarządzaj grupami</RouterLink>
      </div>

      <div class="feature-card">
        <div class="feature-icon">💰</div>
        <h3>Dodawanie wydatków</h3>
        <p>
          Rejestruj wydatki w grupach. Określ kto zapłacił i jak podzielić koszty między
          uczestników.
        </p>
        <RouterLink to="/expenses" class="btn btn-primary">Dodaj wydatki</RouterLink>
      </div>

      <div class="feature-card">
        <div class="feature-icon">⚖️</div>
        <h3>Sald i płatności</h3>
        <p>Sprawdź sald wszystkich członków grupy i zobacz jakie płatności należy wykonać.</p>
        <RouterLink to="/balances" class="btn btn-primary">Sprawdź sald</RouterLink>
      </div>
    </div>

    <div class="how-it-works">
      <h2>Jak to działa?</h2>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h4>Dodaj użytkowników</h4>
          <p>Zarejestruj wszystkich uczestników w systemie</p>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <h4>Utwórz grupę</h4>
          <p>Stwórz grupę i dodaj do niej członków</p>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <h4>Dodaj wydatki</h4>
          <p>Rejestruj wydatki i określ podział kosztów</p>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <h4>Sprawdź sald</h4>
          <p>Zobacz kto komu ile powinien i wykonaj płatności</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0 3rem 0;
}

.hero {
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 2rem 0 1rem 0;
}

.hero h1 {
  font-size: 2.3rem;
  margin-bottom: 1rem;
  color: #0b5fff;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.feature-card {
  background: white;
  border: 1px solid #e7e7ed;
  border-radius: 0.5rem;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(11, 95, 255, 0.06);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  min-width: 220px;
  max-width: 320px;
  flex: 1 1 220px;
}

.feature-card:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 4px 16px rgba(11, 95, 255, 0.12);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #0b5fff;
  font-size: 1.15rem;
  font-weight: 700;
}

.feature-card p {
  color: #6c757d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.how-it-works {
  background: #f8f9fa;
  padding: 2.5rem 1.5rem;
  border-radius: 0.5rem;
  margin-top: 3rem;
  box-shadow: 0 2px 8px rgba(11, 95, 255, 0.04);
}

.how-it-works h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #0b5fff;
  font-size: 1.4rem;
  font-weight: 700;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.step {
  text-align: center;
  padding: 1rem 0.5rem;
  min-width: 180px;
  flex: 1 1 180px;
}

.step-number {
  width: 44px;
  height: 44px;
  background: #0b5fff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 auto 1rem;
}

.step h4 {
  margin-bottom: 0.5rem;
  color: #0b5fff;
  font-size: 1.05rem;
  font-weight: 700;
}

.step p {
  color: #6c757d;
  font-size: 0.98rem;
}

.btn {
  display: inline-block;
  font-weight: 500;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition:
    color 0.15s,
    background-color 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  color: #fff;
  background-color: #0b5fff;
  border-color: #0b5fff;
}

.btn-primary:hover {
  background-color: #0053cc;
  border-color: #0053cc;
  color: #fff;
  text-decoration: none;
}

@media (max-width: 900px) {
  .home {
    max-width: 100%;
    padding: 1rem 0 2rem 0;
  }
  .features,
  .steps {
    flex-direction: column;
    gap: 1.5rem;
  }
  .feature-card,
  .step {
    max-width: 100%;
    min-width: 0;
  }
  .how-it-works {
    padding: 1.5rem 0.5rem;
    margin-top: 2rem;
  }
}

@media (max-width: 600px) {
  .hero h1 {
    font-size: 1.3rem;
  }
  .hero-subtitle {
    font-size: 0.98rem;
  }
  .feature-card h3 {
    font-size: 1rem;
  }
  .how-it-works h2 {
    font-size: 1.1rem;
  }
  .step h4 {
    font-size: 0.98rem;
  }
}
</style>
