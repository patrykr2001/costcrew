<template>
  <div class="group-management">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Zarządzanie Grupami</h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="addGroup">
          <div class="form-group">
            <label for="groupName">Nazwa grupy</label>
            <input
              id="groupName"
              v-model="newGroup.name"
              type="text"
              class="form-control"
              placeholder="Wprowadź nazwę grupy"
              required
            />
          </div>
          <div class="form-group">
            <label for="groupDescription">Opis (opcjonalnie)</label>
            <textarea
              id="groupDescription"
              v-model="newGroup.description"
              class="form-control"
              rows="3"
              placeholder="Wprowadź opis grupy"
            ></textarea>
          </div>
          <button type="submit" :disabled="!newGroup.name.trim()" class="btn btn-primary">
            Utwórz grupę
          </button>
        </form>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">
        <h3 class="card-title">Lista grup</h3>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nazwa</th>
                <th>Opis</th>
                <th>Data utworzenia</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="group in groups" :key="group.id">
                <td>{{ group.id }}</td>
                <td>{{ group.name }}</td>
                <td>{{ group.description || '-' }}</td>
                <td>{{ formatDate(group.created_at) }}</td>
                <td>
                  <button @click="showMembers(group.id)" class="btn btn-sm btn-outline-primary">
                    Członkowie
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal z członkami grupy -->
    <div v-if="showMembersModal" class="modal-overlay" @click="closeMembersModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">Członkowie grupy: {{ selectedGroup?.name }}</h4>
          <button @click="closeMembersModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="memberSelect">Dodaj członka</label>
            <select id="memberSelect" v-model="selectedMember" class="form-control">
              <option value="">Wybierz użytkownika</option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
            <button
              @click="addMemberToGroup"
              :disabled="!selectedMember"
              class="btn btn-primary mt-2"
            >
              Dodaj członka
            </button>
          </div>

          <h5>Obecni członkowie:</h5>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Imię i nazwisko</th>
                  <th>Email</th>
                  <th>Data dołączenia</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in groupMembers" :key="member.id">
                  <td>{{ member.name }}</td>
                  <td>{{ member.email || '-' }}</td>
                  <td>{{ formatDate(member.joined_at || member.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useExpenseStore, type Group, type User } from '@/stores/expenseStore'

const store = useExpenseStore()
const {
  groups,
  users,
  addGroup: storeAddGroup,
  addMemberToGroup: storeAddMemberToGroup,
  getGroupMembers,
} = store

const newGroup = ref({
  name: '',
  description: '',
})

const showMembersModal = ref(false)
const selectedGroup = ref<Group | null>(null)
const selectedMember = ref('')
const groupMembers = ref<(User & { joined_at?: string })[]>([])

const availableUsers = computed(() => {
  if (!selectedGroup.value) return users.value
  const memberIds = groupMembers.value.map((m) => m.id)
  return users.value.filter((user: User) => !memberIds.includes(user.id))
})

const addGroup = () => {
  if (newGroup.value.name.trim()) {
    storeAddGroup(newGroup.value.name.trim(), newGroup.value.description.trim() || undefined)
    newGroup.value = { name: '', description: '' }
  }
}

const showMembers = (groupId: number) => {
  selectedGroup.value = groups.value.find((g: Group) => g.id === groupId) || null
  groupMembers.value = getGroupMembers(groupId)
  showMembersModal.value = true
}

const closeMembersModal = () => {
  showMembersModal.value = false
  selectedGroup.value = null
  selectedMember.value = ''
  groupMembers.value = []
}

const addMemberToGroup = () => {
  if (selectedMember.value && selectedGroup.value) {
    storeAddMemberToGroup(selectedGroup.value.id, parseInt(selectedMember.value))
    groupMembers.value = getGroupMembers(selectedGroup.value.id)
    selectedMember.value = ''
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pl-PL')
}

onMounted(() => {
  store.loadGroups()
  store.loadUsers()
})
</script>

<style scoped>
.group-management {
  max-width: 1000px;
  margin: 0 auto;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
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

textarea.form-control {
  resize: vertical;
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
