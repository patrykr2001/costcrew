<template>
  <div class="expense-management">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Dodaj wydatek</h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="addExpense">
          <div class="form-group">
            <label for="expenseGroup">Grupa</label>
            <select id="expenseGroup" v-model="newExpense.groupId" class="form-control" required>
              <option value="">Wybierz grupę</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="expenseDescription">Opis wydatku</label>
            <input
              id="expenseDescription"
              v-model="newExpense.description"
              type="text"
              class="form-control"
              placeholder="Wprowadź opis wydatku"
              required
            />
          </div>

          <div class="form-group">
            <label for="expenseAmount">Kwota (zł)</label>
            <input
              id="expenseAmount"
              v-model="newExpense.amount"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              placeholder="0.00"
              required
            />
          </div>

          <div class="form-group">
            <label for="expensePaidBy">Zapłacił</label>
            <select id="expensePaidBy" v-model="newExpense.paidBy" class="form-control" required>
              <option value="">Wybierz osobę</option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Podział kosztów</label>
            <div class="shares-container">
              <div v-for="member in groupMembers" :key="member.id" class="share-item">
                <label class="share-label">
                  <input
                    type="checkbox"
                    v-model="newExpense.shares"
                    :value="member.id"
                    class="share-checkbox"
                  />
                  {{ member.name }}
                </label>
                <input
                  v-if="newExpense.shares.includes(member.id)"
                  v-model="newExpense.shareAmounts[member.id]"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control share-amount"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <button type="submit" :disabled="!canSubmitExpense" class="btn btn-primary">
            Dodaj wydatek
          </button>
        </form>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">
        <h3 class="card-title">Lista wydatków</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Data</th>
                <th>Grupa</th>
                <th>Opis</th>
                <th>Kwota</th>
                <th>Zapłacił</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in expenses" :key="expense.id">
                <td>{{ formatDate(expense.date) }}</td>
                <td>{{ getGroupName(expense.group_id) }}</td>
                <td>{{ expense.description }}</td>
                <td>{{ formatCurrency(expense.amount) }}</td>
                <td>{{ getUserName(expense.paid_by) }}</td>
                <td>
                  <button
                    @click="showExpenseDetails(expense.id)"
                    class="btn btn-sm btn-outline-primary"
                  >
                    Szczegóły
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal ze szczegółami wydatku -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">Szczegóły wydatku</h4>
          <button @click="closeDetailsModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedExpense">
            <h5>{{ selectedExpense.description }}</h5>
            <p><strong>Kwota:</strong> {{ formatCurrency(selectedExpense.amount) }}</p>
            <p><strong>Zapłacił:</strong> {{ getUserName(selectedExpense.paid_by) }}</p>
            <p><strong>Data:</strong> {{ formatDate(selectedExpense.date) }}</p>

            <h6>Podział kosztów:</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Osoba</th>
                    <th>Udział</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="share in expenseShares" :key="share.id">
                    <td>{{ getUserName(share.user_id) }}</td>
                    <td>{{ formatCurrency(share.share_amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useExpenseStore, type Group, type User, type Expense } from '@/stores/expenseStore'

const store = useExpenseStore()
const {
  groups,
  users,
  expenses,
  addExpense: storeAddExpense,
  getGroupMembers,
  getExpenseShares,
} = store

const newExpense = ref({
  groupId: '',
  description: '',
  amount: '',
  paidBy: '',
  shares: [] as number[],
  shareAmounts: {} as Record<number, string>,
})

const showDetailsModal = ref(false)
const selectedExpense = ref<Expense | null>(null)
const expenseShares = ref<any[]>([])
const groupMembers = ref<User[]>([])

const availableUsers = computed(() => {
  if (!newExpense.value.groupId) return users.value
  return getGroupMembers(parseInt(newExpense.value.groupId))
})

const canSubmitExpense = computed(() => {
  return (
    newExpense.value.groupId &&
    newExpense.value.description.trim() &&
    newExpense.value.amount &&
    parseFloat(newExpense.value.amount) > 0 &&
    newExpense.value.paidBy &&
    newExpense.value.shares.length > 0
  )
})

const addExpense = () => {
  if (!canSubmitExpense.value) return

  const shares = newExpense.value.shares.map((userId) => ({
    userId,
    shareAmount: parseFloat(newExpense.value.shareAmounts[userId] || '0'),
  }))

  storeAddExpense(
    parseInt(newExpense.value.groupId),
    parseInt(newExpense.value.paidBy),
    parseFloat(newExpense.value.amount),
    newExpense.value.description.trim(),
    shares,
  )

  // Reset form
  newExpense.value = {
    groupId: '',
    description: '',
    amount: '',
    paidBy: '',
    shares: [],
    shareAmounts: {},
  }
}

const showExpenseDetails = (expenseId: number) => {
  selectedExpense.value = expenses.value.find((e) => e.id === expenseId) || null
  if (selectedExpense.value) {
    expenseShares.value = getExpenseShares(expenseId)
    showDetailsModal.value = true
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedExpense.value = null
  expenseShares.value = []
}

const getGroupName = (groupId: number) => {
  const group = groups.value.find((g) => g.id === groupId)
  return group ? group.name : 'Nieznana grupa'
}

const getUserName = (userId: number) => {
  const user = users.value.find((u) => u.id === userId)
  return user ? user.name : 'Nieznany użytkownik'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pl-PL')
}

const formatCurrency = (amount: number) => {
  return `${amount.toFixed(2)} zł`
}

// Watch for group changes to update members
watch(
  () => newExpense.value.groupId,
  (newGroupId) => {
    if (newGroupId) {
      groupMembers.value = getGroupMembers(parseInt(newGroupId))
      newExpense.value.shares = []
      newExpense.value.shareAmounts = {}
    } else {
      groupMembers.value = []
    }
  },
)

onMounted(() => {
  store.loadGroups()
  store.loadUsers()
  store.loadExpenses()
})
</script>

<style scoped>
.expense-management {
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

.shares-container {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.share-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.share-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
  margin: 0;
}

.share-checkbox {
  margin: 0;
}

.share-amount {
  width: 120px;
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

.btn-outline-primary {
  color: #0b5fff;
  border-color: #0b5fff;
  background-color: transparent;
}

.btn-outline-primary:hover {
  color: #fff;
  background-color: #0b5fff;
  border-color: #0b5fff;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
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

.table-sm th,
.table-sm td {
  padding: 0.3rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e7e7ed;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

.modal-body {
  padding: 1rem;
}
</style>
