import * as postService from '../services/postService.js';
import { uploadFileToR2 } from '../services/storageService.js';

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await postService.getAllPosts();

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const getPublishedPosts = async (req, res, next) => {
  try {
    const posts = await postService.getPublishedPosts();

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await postService.getPostById(+req.params.id);

    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const file = req.file;
    const published = JSON.parse(req.body.published);

    if (!file) {
      throw createFileError('No file been upload.');
    }

    const imageKey = await uploadFileToR2(
      file.originalname,
      file.buffer,
      file.mimetype,
      published
    );

    const post = await postService.createPost({ ...req.body, published, imageKey, authorId: req.user.id });

    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(+req.params.id, req.body);

    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await postService.deletePost(+req.params.id);

    res.json(post);
  } catch (err) {
    next(err);
  }
};
