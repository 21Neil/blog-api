import { Router } from 'express';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  getPostCoverImage,
  updatePost,
} from '../controllers/postController.js';
import { deleteComment } from '../controllers/commentController.js';
import multer from 'multer';

const adminRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

adminRouter.get('/posts', getAllPosts);
adminRouter.post('/posts', upload.single('cover_image'), createPost);
adminRouter.put('/posts/:id',upload.single('cover_image'), updatePost);
adminRouter.delete('/posts/:id', deletePost);
adminRouter.post('/posts/:id', getPost);
adminRouter.delete('/comments/:id', deleteComment);
adminRouter.get('/posts/images/:key', getPostCoverImage);

export default adminRouter;
