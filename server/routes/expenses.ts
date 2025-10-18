import express from 'express'
import { getDatabase } from '../database/database'

const router = express.Router()

// GET /api/expenses - Pobierz wszystkie wydatki
router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM expenses ORDER BY date DESC')
    const expenses = stmt.all()
    res.json(expenses)
  } catch (error) {
    console.error('Błąd podczas pobierania wydatków:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania wydatków' })
  }
})

// GET /api/expenses/group/:groupId - Pobierz wydatki grupy
router.get('/group/:groupId', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM expenses WHERE group_id = ? ORDER BY date DESC')
    const expenses = stmt.all(parseInt(req.params.groupId))
    res.json(expenses)
  } catch (error) {
    console.error('Błąd podczas pobierania wydatków grupy:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania wydatków grupy' })
  }
})

// GET /api/expenses/:id - Pobierz wydatek po ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?')
    const expense = stmt.get(parseInt(req.params.id))

    if (!expense) {
      return res.status(404).json({ error: 'Wydatek nie został znaleziony' })
    }

    res.json(expense)
  } catch (error) {
    console.error('Błąd podczas pobierania wydatku:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania wydatku' })
  }
})

// GET /api/expenses/:id/shares - Pobierz udziały wydatku
router.get('/:id/shares', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM expense_shares WHERE expense_id = ?')
    const shares = stmt.all(parseInt(req.params.id))
    res.json(shares)
  } catch (error) {
    console.error('Błąd podczas pobierania udziałów wydatku:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania udziałów wydatku' })
  }
})

// POST /api/expenses - Dodaj nowy wydatek
router.post('/', (req, res) => {
  try {
    const { groupId, paidBy, amount, description, shares } = req.body

    if (!groupId || !paidBy || !amount || !description || !shares || shares.length === 0) {
      return res.status(400).json({
        error: 'Wszystkie pola są wymagane: groupId, paidBy, amount, description, shares',
      })
    }

    const db = getDatabase()

    // Sprawdź czy grupa istnieje
    const groupStmt = db.prepare('SELECT * FROM groups WHERE id = ?')
    const group = groupStmt.get(groupId)

    if (!group) {
      return res.status(404).json({ error: 'Grupa nie została znaleziona' })
    }

    // Sprawdź czy użytkownik istnieje
    const userStmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const user = userStmt.get(paidBy)

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' })
    }

    const insertExpense = db.prepare(
      'INSERT INTO expenses (group_id, paid_by, amount, description) VALUES (?, ?, ?, ?)',
    )
    const insertShare = db.prepare(
      'INSERT INTO expense_shares (expense_id, user_id, share_amount) VALUES (?, ?, ?)',
    )

    const transaction = db.transaction(() => {
      const result = insertExpense.run(groupId, paidBy, amount, description)
      const expenseId = result.lastInsertRowid

      shares.forEach((share: any) => {
        insertShare.run(expenseId, share.userId, share.shareAmount)
      })

      return expenseId
    })

    const expenseId = transaction()

    const newExpense = {
      id: expenseId,
      group_id: groupId,
      paid_by: paidBy,
      amount,
      description,
      date: new Date().toISOString(),
    }

    res.status(201).json(newExpense)
  } catch (error) {
    console.error('Błąd podczas dodawania wydatku:', error)
    res.status(500).json({ error: 'Błąd podczas dodawania wydatku' })
  }
})

// DELETE /api/expenses/:id - Usuń wydatek
router.delete('/:id', (req, res) => {
  try {
    const expenseId = parseInt(req.params.id)
    const db = getDatabase()

    // Sprawdź czy wydatek istnieje
    const checkStmt = db.prepare('SELECT * FROM expenses WHERE id = ?')
    const existingExpense = checkStmt.get(expenseId)

    if (!existingExpense) {
      return res.status(404).json({ error: 'Wydatek nie został znaleziony' })
    }

    const deleteSharesStmt = db.prepare('DELETE FROM expense_shares WHERE expense_id = ?')
    const deleteExpenseStmt = db.prepare('DELETE FROM expenses WHERE id = ?')

    deleteSharesStmt.run(expenseId)
    deleteExpenseStmt.run(expenseId)

    res.json({ message: 'Wydatek został usunięty' })
  } catch (error) {
    console.error('Błąd podczas usuwania wydatku:', error)
    res.status(500).json({ error: 'Błąd podczas usuwania wydatku' })
  }
})

export { router as expenseRoutes }
