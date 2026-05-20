import 'dotenv/config'
import './config'
import { app } from './app'

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`[API] 서버 시작: http://localhost:${PORT}`)
})
