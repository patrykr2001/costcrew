import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { userRoutes } from './routes/users'
import { groupRoutes } from './routes/groups'
import { expenseRoutes } from './routes/expenses'
import { balanceRoutes } from './routes/balances'
import { initializeDatabase } from './database/database'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Inicjalizacja bazy danych
initializeDatabase()

// Routes
app.use('/api/users', userRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/balances', balanceRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CostCrew API działa poprawnie' })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Wystąpił błąd serwera' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint nie został znaleziony' })
})

app.listen(PORT, () => {
  console.log(`🚀 Serwer CostCrew działa na porcie ${PORT}`)
  console.log(`📊 API dostępne pod adresem: http://localhost:${PORT}/api`)
})
