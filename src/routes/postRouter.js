import { Router } from 'express'
import { getAllPosts, getPost } from '../controllers/postController.js'

const postRouter = Router()

postRouter.get('/', getAllPosts)
postRouter.get('/:id', getPost)

export default postRouter
