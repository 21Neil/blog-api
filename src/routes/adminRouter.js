import { Router } from 'express'
import { createPost, deletePost, getAllPosts, updatePost } from '../controllers/postController.js';
import { deleteComment } from '../controllers/commentController.js';
import multer from 'multer';

const adminRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

adminRouter.get('/posts', getAllPosts)
adminRouter.post('/posts', upload.single('cover_image'), createPost)
adminRouter.put('/posts/:id', updatePost)
adminRouter.delete('/posts/:id', deletePost)
adminRouter.delete('/comments/:id', deleteComment)

export default adminRouter
