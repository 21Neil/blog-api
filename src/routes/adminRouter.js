import { Router } from 'express';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  getPrivateImage,
  updatePost,
  uploadContentImage,
} from '../controllers/postController.js';
import { deleteComment } from '../controllers/commentController.js';
import multer from 'multer';
import { changePassword } from '../controllers/authController.js';

const adminRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

adminRouter.get('/posts', getAllPosts);
adminRouter.post('/posts', upload.single('cover_image'), createPost);
adminRouter.post(
  '/posts/upload-content-image',
  upload.single('uploadImage'),
  uploadContentImage
);
adminRouter.put('/posts/:id', upload.single('cover_image'), updatePost);
adminRouter.delete('/posts/:id', deletePost);
adminRouter.post('/posts/:id', getPost);
adminRouter.delete('/comments/:id', deleteComment);
adminRouter.get('/posts/images/:key', getPrivateImage);
adminRouter.put('/password', changePassword)

export default adminRouter;
