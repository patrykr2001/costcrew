import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: number
  name: string
  email?: string
  created_at: string
}

export interface Group {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface Expense {
  id: number
  group_id: number
  paid_by: number
  amount: number
  description: string
  date: string
}

export interface ExpenseShare {
  id: number
  expense_id: number
  user_id: number
  share_amount: number
}

export interface Payment {
  id: number
  from_user_id: number
  to_user_id: number
  group_id: number
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
}

const API_BASE_URL = 'http://localhost:3000/api'

export const useExpenseStore = defineStore('expense', () => {
  const users = ref<User[]>([])
  const groups = ref<Group[]>([])
  const expenses = ref<Expense[]>([])
  const expenseShares = ref<ExpenseShare[]>([])
  const payments = ref<Payment[]>([])
  const currentUser = ref<User | null>(null)

  // Helper function do wykonywania zapytań API
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd API')
      }

      return await response.json()
    } catch (error) {
      console.error('Błąd API:', error)
      throw error
    }
  }

  // Akcje dla użytkowników
  const addUser = async (name: string, email?: string) => {
    const newUser = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    })
    users.value.push(newUser)
    return newUser
  }

  const loadUsers = async () => {
    users.value = await apiRequest('/users')
  }

  // Akcje dla grup
  const addGroup = async (name: string, description?: string) => {
    const newGroup = await apiRequest('/groups', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    })
    groups.value.push(newGroup)
    return newGroup
  }

  const loadGroups = async () => {
    groups.value = await apiRequest('/groups')
  }

  const addMemberToGroup = async (groupId: number, userId: number) => {
    await apiRequest(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  const getGroupMembers = async (groupId: number) => {
    return await apiRequest(`/groups/${groupId}/members`)
  }

  // Akcje dla wydatków
  const addExpense = async (
    groupId: number,
    paidBy: number,
    amount: number,
    description: string,
    shares: { userId: number; shareAmount: number }[],
  ) => {
    const newExpense = await apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify({
        groupId,
        paidBy,
        amount,
        description,
        shares,
      }),
    })
    expenses.value.push(newExpense)
    return newExpense
  }

  const loadExpenses = async (groupId?: number) => {
    if (groupId) {
      expenses.value = await apiRequest(`/expenses/group/${groupId}`)
    } else {
      expenses.value = await apiRequest('/expenses')
    }
  }

  const getExpenseShares = async (expenseId: number) => {
    return await apiRequest(`/expenses/${expenseId}/shares`)
  }

  // Obliczanie sald
  const calculateBalances = async (groupId: number) => {
    const balanceData = await apiRequest(`/balances/group/${groupId}`)
    const balances = new Map<number, number>()

    balanceData.forEach((item: { user: User; balance: number }) => {
      balances.set(item.user.id, item.balance)
    })

    return balances
  }

  // Generowanie płatności do wyrównania sald
  const generatePayments = async (groupId: number) => {
    return await apiRequest(`/balances/group/${groupId}/payments`)
  }

  // Inicjalizacja
  const initialize = async () => {
    try {
      await Promise.all([loadUsers(), loadGroups(), loadExpenses()])
    } catch (error) {
      console.error('Błąd podczas inicjalizacji store:', error)
    }
  }

  return {
    users,
    groups,
    expenses,
    expenseShares,
    payments,
    currentUser,
    addUser,
    loadUsers,
    addGroup,
    loadGroups,
    addMemberToGroup,
    getGroupMembers,
    addExpense,
    loadExpenses,
    getExpenseShares,
    calculateBalances,
    generatePayments,
    initialize,
  }
})
