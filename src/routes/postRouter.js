import { Router } from 'express'
import { getAllPosts, getPost } from '../controllers/postController.js'
import { createComment, getCommentByPostId } from '../controllers/commentController.js'

const postRouter = Router()

postRouter.get('/', getAllPosts)
postRouter.get('/:id', getPost)
postRouter.get('/:id/comments', getCommentByPostId)
postRouter.post('/:id/comments', createComment)

export default postRouter
