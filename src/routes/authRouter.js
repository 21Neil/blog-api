import { Router } from 'express'
import { checkLogin, login } from '../controllers/authController.js'
import { authenticated } from '../middleware/authenticated.js'

const authRouter = Router()

authRouter.post('/login', login)
authRouter.get('/check-login',authenticated, checkLogin)

export default authRouter
