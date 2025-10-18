<template>
  <div class="balance-view">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Sald i płatności</h3>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label for="balanceGroup">Wybierz grupę</label>
          <select
            id="balanceGroup"
            v-model="selectedGroupId"
            class="form-control"
            @change="loadGroupBalances"
          >
            <option value="">Wybierz grupę</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="selectedGroupId" class="card mt-4">
      <div class="card-header">
        <h3 class="card-title">Sald członków grupy</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Imię i nazwisko</th>
                <th>Saldo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in groupMembers" :key="member.id">
                <td>{{ member.name }}</td>
                <td :class="getBalanceClass(balances.get(member.id) || 0)">
                  {{ formatCurrency(balances.get(member.id) || 0) }}
                </td>
                <td>
                  <span :class="getStatusClass(balances.get(member.id) || 0)">
                    {{ getStatusText(balances.get(member.id) || 0) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="selectedGroupId && payments.length > 0" class="card mt-4">
      <div class="card-header">
        <h3 class="card-title">Płatności do wyrównania</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Od</th>
                <th>Do</th>
                <th>Kwota</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id">
                <td>{{ getUserName(payment.from_user_id) }}</td>
                <td>{{ getUserName(payment.to_user_id) }}</td>
                <td>{{ formatCurrency(payment.amount) }}</td>
                <td>
                  <span :class="getPaymentStatusClass(payment.status)">
                    {{ getPaymentStatusText(payment.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="selectedGroupId && payments.length === 0 && hasExpenses" class="card mt-4">
      <div class="card-header">
        <h3 class="card-title">Wszystkie sald są wyrównane!</h3>
      </div>
      <div class="card-body">
        <p class="text-success">
          Brak płatności do wykonania. Wszystkie sald w grupie są wyrównane.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useExpenseStore, type User } from '@/stores/expenseStore'

const store = useExpenseStore()
const { groups, users, expenses, getGroupMembers, calculateBalances, generatePayments } = store

const selectedGroupId = ref('')
const groupMembers = ref<User[]>([])
const balances = ref(new Map<number, number>())
const payments = ref<any[]>([])

const hasExpenses = computed(() => {
  if (!selectedGroupId.value) return false
  return expenses.value.some((e) => e.group_id === parseInt(selectedGroupId.value))
})

const loadGroupBalances = () => {
  if (!selectedGroupId.value) {
    groupMembers.value = []
    balances.value = new Map()
    payments.value = []
    return
  }

  const groupId = parseInt(selectedGroupId.value)
  groupMembers.value = getGroupMembers(groupId)
  balances.value = calculateBalances(groupId)
  payments.value = generatePayments(groupId)
}

const getBalanceClass = (balance: number) => {
  if (balance > 0) return 'text-success'
  if (balance < 0) return 'text-danger'
  return 'text-muted'
}

const getStatusClass = (balance: number) => {
  if (balance > 0) return 'badge badge-success'
  if (balance < 0) return 'badge badge-danger'
  return 'badge badge-secondary'
}

const getStatusText = (balance: number) => {
  if (balance > 0) return 'Należność'
  if (balance < 0) return 'Dług'
  return 'Wyrównane'
}

const getPaymentStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'badge badge-success'
    case 'cancelled':
      return 'badge badge-danger'
    default:
      return 'badge badge-warning'
  }
}

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Zrealizowana'
    case 'cancelled':
      return 'Anulowana'
    default:
      return 'Oczekująca'
  }
}

const getUserName = (userId: number) => {
  const user = users.value.find((u) => u.id === userId)
  return user ? user.name : 'Nieznany użytkownik'
}

const formatCurrency = (amount: number) => {
  return `${amount.toFixed(2)} zł`
}

onMounted(() => {
  store.loadGroups()
  store.loadUsers()
  store.loadExpenses()
})
</script>

<style scoped>
.balance-view {
  max-width: 1000px;
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

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-muted {
  color: #6c757d !important;
}

.badge {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}

.badge-success {
  color: #fff;
  background-color: #28a745;
}

.badge-danger {
  color: #fff;
  background-color: #dc3545;
}

.badge-warning {
  color: #212529;
  background-color: #ffc107;
}

.badge-secondary {
  color: #fff;
  background-color: #6c757d;
}
</style>
