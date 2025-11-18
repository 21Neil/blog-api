import { Router } from 'express';
import {
  getAllPublishedPosts,
  getPublishedPost,
} from '../controllers/postController.js';
import {
  createComment,
  getCommentByPostId,
} from '../controllers/commentController.js';

const postRouter = Router();

postRouter.get('/', getAllPublishedPosts);
postRouter.get('/:id', getPublishedPost);
postRouter.get('/:id/comments', getCommentByPostId);
postRouter.post('/:id/comments', createComment);

export default postRouter;
