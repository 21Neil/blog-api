import * as postService from '../services/postService.js';
import {
  deleteFileFromR2,
  getFileFromR2,
  publishedFileInR2,
  unpublishedFileInR2,
  uploadFileToR2,
} from '../services/storageService.js';

const getImageUrl = (key, published) => {
  const baseUrl = process.env.API_BASE_URL;

  return published
    ? `https://blog-api.twoneil.party/${key}`
    : `${baseUrl}/admin/posts/images/${key}`;
};

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await postService.getAllPosts();
    const postsWithImageURL = posts.map(item => ({
      id: item.id,
      title: item.title,
      imageUrl: getImageUrl(item.imageKey, item.published),
      TEXTContent: item.TEXTContent,
      published: item.published,
    }));

    res.json(postsWithImageURL);
  } catch (err) {
    next(err);
  }
};

export const getAllPublishedPosts = async (req, res, next) => {
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
    const postRes = {
      title: post.title,
      imageUrl: getImageUrl(post.imageKey, post.published),
      TEXTContent: post.TEXTContent,
      HTMLContent: post.HTMLContent,
      JSONContent: post.JSONContent,
    };

    res.json(postRes);
  } catch (err) {
    next(err);
  }
};

export const getPublishedPost = async (req, res, next) => {
  try {
    const post = await postService.getPublishedPostById(+req.params.id);

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

const handleImageReplacement = async (file, reqPublished, prevPost) => {
  try {
    const imageKey = await uploadFileToR2(
      file.originalname,
      file.buffer,
      file.mimetype,
      reqPublished
    );

    await deleteFileFromR2(prevPost.imageKey, prevPost.published);

    return imageKey;
  } catch (err) {
    next(err);
  }
};

const handlePublishedStatusChange = async (reqPublished, key) => {
  if (reqPublished) await publishedFileInR2(key);
  if (!reqPublished) await unpublishedFileInR2(key);
};

export const updatePost = async (req, res, next) => {
  try {
    const prevPost = await postService.getPostById(+req.params.id);
    const reqPublished = JSON.parse(req.body.published);
    const file = req.file;
    const id = +req.params.id;

    // 有新圖片上傳
    if (file) {
      const imageKey = await handleImageReplacement(
        file,
        reqPublished,
        prevPost
      );
      const post = await postService.updatePost(id, {
        ...req.body,
        imageKey,
        published: reqPublished,
      });

      return res.json(post);
    }

    // 沒有新圖片上傳，但發布狀態變更
    if (prevPost.published !== reqPublished) {
      await handlePublishedStatusChange(reqPublished, prevPost.imageKey);
    }

    // 更新䩞文
    const post = await postService.updatePost(id, {
      ...req.body,
      published: reqPublished,
    });

    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await postService.deletePost(+req.params.id);
    await deleteFileFromR2(post.imageKey, post.published);

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

export const uploadContentImage = async (req, res, next) => {
  const file = req.file;
  const imageKey = await uploadFileToR2(
    file.originalname,
    file.buffer,
    file.mimetype,
    false
  );

  res.json(getImageUrl(imageKey, false));
};
