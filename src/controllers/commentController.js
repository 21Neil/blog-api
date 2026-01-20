import * as commentService from '../services/commentService.js';
import { createError } from '../utils/customErrors.js';

export const getCommentByPostId = async (req, res, next) => {
  try {
    const comments = await commentService.getCommentByPostId(+req.params.id);

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req, res, next) => {
  try {
    if (req.body.name.length > 15)
      throw createError(
        'STRING_TOO_LONG',
        'Name must not exceed 15 character',
        400,
      );
    const comment = await commentService.createComment(
      +req.params.id,
      req.body,
    );

    res.json(comment);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await commentService.deleteComment(+req.params.id);

    res.json(comment);
  } catch (err) {
    next(err);
  }
};
