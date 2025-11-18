import * as postService from '../services/postService.js';
import { deleteFileFromR2, getFileFromR2, uploadFileToR2 } from '../services/storageService.js';

export const getAllPosts = async (req, res, next) => {
  const baseUrl = process.env.API_BASE_URL;
  try {
    const posts = await postService.getAllPosts();
    const postsWithImageURL = posts.map(item => {
      if (item.published)
        return {
          title: item.title,
          imageUrl: `https://blog-api.twoneil.party/${item.imageKey}`,
          TEXTContent: item.TEXTContent,
        };
      if (!item.published)
        return {
          title: item.title,
          imageUrl: `${baseUrl}/admin/posts/images/${item.imageKey}`,
          TEXTContent: item.TEXTContent,
        };
    });

    res.json(postsWithImageURL);
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

    const post = await postService.createPost({
      ...req.body,
      published,
      imageKey,
      authorId: req.user.id,
    });

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
    deleteFileFromR2(post.imageKey)

    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const getPostCoverImage = async (req, res, next) => {
  const imageKey = req.params.key;
  try {
    const image = await getFileFromR2(imageKey);

    if (!image.Body)
      return res.status(404).json({ message: 'Image not found' });

    res.setHeader(
      'Content-Type',
      image.ContentType || 'application/octet-stream'
    );
    res.setHeader('Content-Disposition', `inline; filename="${imageKey}"`);
    if (image.ContentLength)
      res.setHeader('Content-Length', image.ContentLength);

    image.Body.pipe(res);
  } catch (err) {
    if (err.statusCode === 404)
      return res.status(404).json({ message: err.message });
    next(err);
  }
};
