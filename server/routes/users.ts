import express from 'express'
import { getDatabase } from '../database/database'

const router = express.Router()

// GET /api/users - Pobierz wszystkich użytkowników
router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users ORDER BY name')
    const users = stmt.all()
    res.json(users)
  } catch (error) {
    console.error('Błąd podczas pobierania użytkowników:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania użytkowników' })
  }
})

// GET /api/users/:id - Pobierz użytkownika po ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const user = stmt.get(parseInt(req.params.id))

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' })
    }

    res.json(user)
  } catch (error) {
    console.error('Błąd podczas pobierania użytkownika:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania użytkownika' })
  }
})

// POST /api/users - Dodaj nowego użytkownika
router.post('/', (req, res) => {
  try {
    const { name, email } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Imię jest wymagane' })
    }

    const db = getDatabase()
    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
    const result = stmt.run(name.trim(), email?.trim() || null)

    const newUser = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: email?.trim() || null,
      created_at: new Date().toISOString(),
    }

    res.status(201).json(newUser)
  } catch (error) {
    console.error('Błąd podczas dodawania użytkownika:', error)
    res.status(500).json({ error: 'Błąd podczas dodawania użytkownika' })
  }
})

// PUT /api/users/:id - Aktualizuj użytkownika
router.put('/:id', (req, res) => {
  try {
    const { name, email } = req.body
    const userId = parseInt(req.params.id)

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Imię jest wymagane' })
    }

    const db = getDatabase()

    // Sprawdź czy użytkownik istnieje
    const checkStmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const existingUser = checkStmt.get(userId)

    if (!existingUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' })
    }

    const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
    stmt.run(name.trim(), email?.trim() || null, userId)

    const updatedUser = {
      id: userId,
      name: name.trim(),
      email: email?.trim() || null,
      created_at: existingUser.created_at,
    }

    res.json(updatedUser)
  } catch (error) {
    console.error('Błąd podczas aktualizacji użytkownika:', error)
    res.status(500).json({ error: 'Błąd podczas aktualizacji użytkownika' })
  }
})

// DELETE /api/users/:id - Usuń użytkownika
router.delete('/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const db = getDatabase()

    // Sprawdź czy użytkownik istnieje
    const checkStmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const existingUser = checkStmt.get(userId)

    if (!existingUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' })
    }

    // Sprawdź czy użytkownik nie jest członkiem żadnej grupy
    const memberStmt = db.prepare('SELECT COUNT(*) as count FROM group_members WHERE user_id = ?')
    const memberCount = memberStmt.get(userId)

    if (memberCount.count > 0) {
      return res.status(400).json({
        error: 'Nie można usunąć użytkownika, który jest członkiem grupy',
      })
    }

    // Sprawdź czy użytkownik nie ma żadnych wydatków
    const expenseStmt = db.prepare('SELECT COUNT(*) as count FROM expenses WHERE paid_by = ?')
    const expenseCount = expenseStmt.get(userId)

    if (expenseCount.count > 0) {
      return res.status(400).json({
        error: 'Nie można usunąć użytkownika, który ma wydatki',
      })
    }

    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    stmt.run(userId)

    res.json({ message: 'Użytkownik został usunięty' })
  } catch (error) {
    console.error('Błąd podczas usuwania użytkownika:', error)
    res.status(500).json({ error: 'Błąd podczas usuwania użytkownika' })
  }
})

export { router as userRoutes }
