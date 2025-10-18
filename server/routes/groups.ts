import express from 'express'
import { getDatabase } from '../database/database'

const router = express.Router()

// GET /api/groups - Pobierz wszystkie grupy
router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM groups ORDER BY name')
    const groups = stmt.all()
    res.json(groups)
  } catch (error) {
    console.error('Błąd podczas pobierania grup:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania grup' })
  }
})

// GET /api/groups/:id - Pobierz grupę po ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM groups WHERE id = ?')
    const group = stmt.get(parseInt(req.params.id))

    if (!group) {
      return res.status(404).json({ error: 'Grupa nie została znaleziona' })
    }

    res.json(group)
  } catch (error) {
    console.error('Błąd podczas pobierania grupy:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania grupy' })
  }
})

// GET /api/groups/:id/members - Pobierz członków grupy
router.get('/:id/members', (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT u.* FROM users u
      JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
      ORDER BY u.name
    `)
    const members = stmt.all(parseInt(req.params.id))
    res.json(members)
  } catch (error) {
    console.error('Błąd podczas pobierania członków grupy:', error)
    res.status(500).json({ error: 'Błąd podczas pobierania członków grupy' })
  }
})

// POST /api/groups - Dodaj nową grupę
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nazwa grupy jest wymagana' })
    }

    const db = getDatabase()
    const stmt = db.prepare('INSERT INTO groups (name, description) VALUES (?, ?)')
    const result = stmt.run(name.trim(), description?.trim() || null)

    const newGroup = {
      id: result.lastInsertRowid,
      name: name.trim(),
      description: description?.trim() || null,
      created_at: new Date().toISOString(),
    }

    res.status(201).json(newGroup)
  } catch (error) {
    console.error('Błąd podczas dodawania grupy:', error)
    res.status(500).json({ error: 'Błąd podczas dodawania grupy' })
  }
})

// POST /api/groups/:id/members - Dodaj członka do grupy
router.post('/:id/members', (req, res) => {
  try {
    const { userId } = req.body
    const groupId = parseInt(req.params.id)

    if (!userId) {
      return res.status(400).json({ error: 'ID użytkownika jest wymagane' })
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
    const user = userStmt.get(userId)

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' })
    }

    // Sprawdź czy użytkownik już jest członkiem grupy
    const memberStmt = db.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?')
    const existingMember = memberStmt.get(groupId, userId)

    if (existingMember) {
      return res.status(400).json({ error: 'Użytkownik już jest członkiem tej grupy' })
    }

    const insertStmt = db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)')
    insertStmt.run(groupId, userId)

    res.status(201).json({ message: 'Członek został dodany do grupy' })
  } catch (error) {
    console.error('Błąd podczas dodawania członka do grupy:', error)
    res.status(500).json({ error: 'Błąd podczas dodawania członka do grupy' })
  }
})

// DELETE /api/groups/:id/members/:userId - Usuń członka z grupy
router.delete('/:id/members/:userId', (req, res) => {
  try {
    const groupId = parseInt(req.params.id)
    const userId = parseInt(req.params.userId)
    const db = getDatabase()

    const stmt = db.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?')
    const result = stmt.run(groupId, userId)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Członek nie został znaleziony w grupie' })
    }

    res.json({ message: 'Członek został usunięty z grupy' })
  } catch (error) {
    console.error('Błąd podczas usuwania członka z grupy:', error)
    res.status(500).json({ error: 'Błąd podczas usuwania członka z grupy' })
  }
})

// PUT /api/groups/:id - Aktualizuj grupę
router.put('/:id', (req, res) => {
  try {
    const { name, description } = req.body
    const groupId = parseInt(req.params.id)

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nazwa grupy jest wymagana' })
    }

    const db = getDatabase()

    // Sprawdź czy grupa istnieje
    const checkStmt = db.prepare('SELECT * FROM groups WHERE id = ?')
    const existingGroup = checkStmt.get(groupId)

    if (!existingGroup) {
      return res.status(404).json({ error: 'Grupa nie została znaleziona' })
    }

    const stmt = db.prepare('UPDATE groups SET name = ?, description = ? WHERE id = ?')
    stmt.run(name.trim(), description?.trim() || null, groupId)

    const updatedGroup = {
      id: groupId,
      name: name.trim(),
      description: description?.trim() || null,
      created_at: existingGroup.created_at,
    }

    res.json(updatedGroup)
  } catch (error) {
    console.error('Błąd podczas aktualizacji grupy:', error)
    res.status(500).json({ error: 'Błąd podczas aktualizacji grupy' })
  }
})

// DELETE /api/groups/:id - Usuń grupę
router.delete('/:id', (req, res) => {
  try {
    const groupId = parseInt(req.params.id)
    const db = getDatabase()

    // Sprawdź czy grupa istnieje
    const checkStmt = db.prepare('SELECT * FROM groups WHERE id = ?')
    const existingGroup = checkStmt.get(groupId)

    if (!existingGroup) {
      return res.status(404).json({ error: 'Grupa nie została znaleziona' })
    }

    // Sprawdź czy grupa ma wydatki
    const expenseStmt = db.prepare('SELECT COUNT(*) as count FROM expenses WHERE group_id = ?')
    const expenseCount = expenseStmt.get(groupId)

    if (expenseCount.count > 0) {
      return res.status(400).json({
        error: 'Nie można usunąć grupy, która ma wydatki',
      })
    }

    // Usuń członków grupy
    const deleteMembersStmt = db.prepare('DELETE FROM group_members WHERE group_id = ?')
    deleteMembersStmt.run(groupId)

    // Usuń grupę
    const deleteGroupStmt = db.prepare('DELETE FROM groups WHERE id = ?')
    deleteGroupStmt.run(groupId)

    res.json({ message: 'Grupa została usunięta' })
  } catch (error) {
    console.error('Błąd podczas usuwania grupy:', error)
    res.status(500).json({ error: 'Błąd podczas usuwania grupy' })
  }
})

export { router as groupRoutes }
