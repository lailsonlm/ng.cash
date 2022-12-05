import express from 'express'
import cors from 'cors'
import { authRoutes } from './routes/auth.routes'
import { transactionsRoutes } from './routes/transactions.routes'

const app = express()
app.use(express.json())
app.use(cors())

app.use(authRoutes);
app.use(transactionsRoutes);

app.listen(3333, () => console.log(`Server listening on port 3333`))