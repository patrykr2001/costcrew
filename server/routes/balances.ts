import express from 'express'
import { getDatabase } from '../database/database'

const router = express.Router()

// GET /api/balances/group/:groupId - Pobierz sald grupy
router.get('/group/:groupId', (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId)
    const db = getDatabase()

    // Pobierz członków grupy
    const membersStmt = db.prepare(`
      SELECT u.* FROM users u
      JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY u.name
    `)
    const members = membersStmt.all(groupId)

    // Pobierz wydatki grupy
    const expensesStmt = db.prepare('SELECT * FROM expenses WHERE group_id = ?')
    const expenses = expensesStmt.all(groupId)

    // Oblicz sald
    const balances = new Map()
    members.forEach((member: any) => balances.set(member.id, 0))

    expenses.forEach((expense: any) => {
      const sharesStmt = db.prepare('SELECT * FROM expense_shares WHERE expense_id = ?')
      const shares = sharesStmt.all(expense.id)

      // Osoba płacąca otrzymuje pełną kwotę
      balances.set(expense.paid_by, (balances.get(expense.paid_by) || 0) + expense.amount)

      // Każdy uczestnik płaci swój udział
      shares.forEach((share: any) => {
        balances.set(share.user_id, (balances.get(share.user_id) || 0) - share.share_amount)
      })
    })

    const balanceArray = members.map((member: any) => ({
      user: member,
      balance: balances.get(member.id) || 0,
    }))

    res.json(balanceArray)
  } catch (error) {
    console.error('Błąd podczas obliczania sald:', error)
    res.status(500).json({ error: 'Błąd podczas obliczania sald' })
  }
})

// GET /api/balances/group/:groupId/payments - Generuj płatności do wyrównania
router.get('/group/:groupId/payments', (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId)
    const db = getDatabase()

    // Pobierz członków grupy
    const membersStmt = db.prepare(`
      SELECT u.* FROM users u
      JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY u.name
    `)
    const members = membersStmt.all(groupId)

    // Pobierz wydatki grupy
    const expensesStmt = db.prepare('SELECT * FROM expenses WHERE group_id = ?')
    const expenses = expensesStmt.all(groupId)

    // Oblicz sald
    const balances = new Map()
    members.forEach((member: any) => balances.set(member.id, 0))

    expenses.forEach((expense: any) => {
      const sharesStmt = db.prepare('SELECT * FROM expense_shares WHERE expense_id = ?')
      const shares = sharesStmt.all(expense.id)

      balances.set(expense.paid_by, (balances.get(expense.paid_by) || 0) + expense.amount)

      shares.forEach((share: any) => {
        balances.set(share.user_id, (balances.get(share.user_id) || 0) - share.share_amount)
      })
    })

    // Generuj płatności
    const sortedMembers = members.sort((a: any, b: any) => {
      const balanceA = balances.get(a.id) || 0
      const balanceB = balances.get(b.id) || 0
      return balanceA - balanceB
    })

    const payments = []
    let i = 0
    let j = sortedMembers.length - 1

    while (i < j) {
      const debtor = sortedMembers[i]
      const creditor = sortedMembers[j]
      const debtBalance = balances.get(debtor.id) || 0
      const creditBalance = balances.get(creditor.id) || 0

      if (debtBalance >= 0 || creditBalance <= 0) break

      const amount = Math.min(-debtBalance, creditBalance)

      if (amount > 0.01) {
        payments.push({
          id: Date.now() + i,
          from_user_id: debtor.id,
          to_user_id: creditor.id,
          group_id: groupId,
          amount,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
      }

      balances.set(debtor.id, debtBalance + amount)
      balances.set(creditor.id, creditBalance - amount)

      if (balances.get(debtor.id) === 0) i++
      if (balances.get(creditor.id) === 0) j--
    }

    res.json(payments)
  } catch (error) {
    console.error('Błąd podczas generowania płatności:', error)
    res.status(500).json({ error: 'Błąd podczas generowania płatności' })
  }
})

// GET /api/balances/group/:groupId/summary - Pobierz podsumowanie grupy
router.get('/group/:groupId/summary', (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId)
    const db = getDatabase()

    // Pobierz informacje o grupie
    const groupStmt = db.prepare('SELECT * FROM groups WHERE id = ?')
    const group = groupStmt.get(groupId)

    if (!group) {
      return res.status(404).json({ error: 'Grupa nie została znaleziona' })
    }

    // Pobierz członków
    const membersStmt = db.prepare(`
      SELECT u.* FROM users u
      JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY u.name
    `)
    const members = membersStmt.all(groupId)

    // Pobierz wydatki
    const expensesStmt = db.prepare('SELECT * FROM expenses WHERE group_id = ? ORDER BY date DESC')
    const expenses = expensesStmt.all(groupId)

    // Oblicz całkowitą kwotę wydatków
    const totalAmount = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0)

    // Oblicz sald
    const balances = new Map()
    members.forEach((member: any) => balances.set(member.id, 0))

    expenses.forEach((expense: any) => {
      const sharesStmt = db.prepare('SELECT * FROM expense_shares WHERE expense_id = ?')
      const shares = sharesStmt.all(expense.id)

      balances.set(expense.paid_by, (balances.get(expense.paid_by) || 0) + expense.amount)

      shares.forEach((share: any) => {
        balances.set(share.user_id, (balances.get(share.user_id) || 0) - share.share_amount)
      })
    })

    const summary = {
      group,
      members: members.length,
      totalExpenses: expenses.length,
      totalAmount,
      balances: members.map((member: any) => ({
        user: member,
        balance: balances.get(member.id) || 0,
      })),
    }

    res.json(summary)
  } catch (error) {
    console.error('Błąd podczas pobierania podsumowania:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania podsumowania' })
  }
})

export { router as balanceRoutes }
