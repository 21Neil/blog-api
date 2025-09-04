import { Router } from 'express'
import { createPost, deletePost, getAllPosts, updatePost } from '../controllers/postController.js';

const adminRouter = Router();

adminRouter.get('/posts', getAllPosts)
adminRouter.post('/posts', createPost)
adminRouter.put('/posts/:id', updatePost)
adminRouter.delete('/posts/:id', deletePost)

export default adminRouter
