<template>
  <div class="user-management">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Zarządzanie Użytkownikami</h3>
      </div>
      <div class="card-body">
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <form @submit.prevent="addUser">
          <div class="form-group">
            <label for="userName">Imię i nazwisko</label>
            <input
              id="userName"
              v-model="newUser.name"
              type="text"
              class="form-control"
              placeholder="Wprowadź imię i nazwisko"
              required
              :disabled="loading"
            />
          </div>
          <div class="form-group">
            <label for="userEmail">Email (opcjonalnie)</label>
            <input
              id="userEmail"
              v-model="newUser.email"
              type="email"
              class="form-control"
              placeholder="Wprowadź email"
              :disabled="loading"
            />
          </div>
          <button type="submit" :disabled="!newUser.name.trim() || loading" class="btn btn-primary">
            <span v-if="loading">Dodawanie...</span>
            <span v-else>Dodaj użytkownika</span>
          </button>
        </form>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">
        <h3 class="card-title">Lista użytkowników</h3>
      </div>
      <div class="card-body">
        <div v-if="loading && users.length === 0" class="text-center">
          <p>Ładowanie użytkowników...</p>
        </div>
        <div v-else-if="users.length === 0" class="text-center">
          <p>Brak użytkowników</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Imię i nazwisko</th>
                <th>Email</th>
                <th>Data utworzenia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email || '-' }}</td>
                <td>{{ formatDate(user.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'

const store = useExpenseStore()
const { users, addUser: storeAddUser } = store

const newUser = ref({
  name: '',
  email: '',
})

const loading = ref(false)
const error = ref('')

const addUser = async () => {
  if (newUser.value.name.trim()) {
    try {
      loading.value = true
      error.value = ''
      await storeAddUser(newUser.value.name.trim(), newUser.value.email.trim() || undefined)
      newUser.value = { name: '', email: '' }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Błąd podczas dodawania użytkownika'
    } finally {
      loading.value = false
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pl-PL')
}

onMounted(async () => {
  try {
    loading.value = true
    await store.loadUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Błąd podczas ładowania użytkowników'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.user-management {
  max-width: 800px;
  margin: 0 auto;
}

.mt-4 {
  margin-top: 1rem;
}

.card {
  border: 1px solid #e7e7ed;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e7e7ed;
  padding: 1rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-body {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control:disabled {
  background-color: #e9ecef;
  opacity: 1;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  cursor: pointer;
}

.btn-primary {
  color: #fff;
  background-color: #0b5fff;
  border-color: #0b5fff;
}

.btn-primary:hover {
  background-color: #0053cc;
  border-color: #0053cc;
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.table {
  width: 100%;
  margin-bottom: 1rem;
  color: #212529;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: top;
  border-top: 1px solid #dee2e6;
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
  background-color: #f8f9fa;
  font-weight: 600;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.table-responsive {
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.alert {
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.text-center {
  text-align: center;
}
</style>
