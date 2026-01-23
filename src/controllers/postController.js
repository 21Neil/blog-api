import sharp from 'sharp';
import * as postService from '../services/postService.js';
import {
  deleteFileFromR2,
  getFileFromR2,
  publishedFileInR2,
  unpublishedFileInR2,
  uploadFileToR2,
} from '../services/storageService.js';
import {
  createTempImage,
  deleteTempImage,
  getTempImage,
  updateTempImage,
} from '../services/tempImageService.js';
import { createError } from '../utils/customErrors.js';
import tiptapConverter from '../utils/tiptapConverter.js';

const getImageUrl = (key, published) => {
  const baseUrl = process.env.API_BASE_URL;
  return published
    ? `https://blog-images.twoneil.party/${key}`
    : `${baseUrl}/api/admin/posts/images/${key}`;
};

const getImageKeysFromContent = content => {
  const imageKeys = content
    .filter(item => item.type === 'image')
    .map(item => item.attrs.src.split('/').pop());

  return imageKeys;
};

const handleImageReplacement = async (file, reqPublished, prevPost) => {
  try {
    const imageKey = await uploadFileToR2(
      file.originalname,
      file.buffer,
      file.mimetype,
      reqPublished,
    );

    await deleteFileFromR2(prevPost.imageKey, prevPost.published);

    return imageKey;
  } catch (err) {
    throw new Error(err);
  }
};

const handleContentImageReplacement = async (key, reqPublished) => {
  try {
    const imageData = await getTempImage(key);

    // 進入此步驟代表內文圖片已被引用了
    if (!imageData.referenced) await updateTempImage(key, { referenced: true });
    // 發布狀態沒變不用改變圖片儲存槽
    if (imageData.published === reqPublished) return;

    await updateTempImage(key, { published: reqPublished });

    handlePublishedStatusChange(key, reqPublished);
  } catch (err) {
    throw new Error(err);
  }
};

const handlePublishedStatusChange = async (key, reqPublished) => {
  if (reqPublished) await publishedFileInR2(key);
  if (!reqPublished) await unpublishedFileInR2(key);
};

const handleContentPublishedStatusChange = async (
  reqPublished,
  JSONRawContent,
) => {
  const JSONContent = JSON.parse(JSONRawContent);
  const content = JSONContent.content;
  const imageKeys = getImageKeysFromContent(content);

  // 處理內文圖片發布狀態
  imageKeys.forEach(
    async key => await handleContentImageReplacement(key, reqPublished),
  );

  // 處理內文圖片連結
  const newContent = content.map(item => {
    if (item.type !== 'image') return item;
    const url = new URL(item.attrs.src);
    const origin = url.origin;
    const path = url.pathname;
    const key = path.substring(path.lastIndexOf('/') + 1);

    if (origin === process.env.API_BASE_URL && reqPublished) {
      item.attrs.src = getImageUrl(key, reqPublished);
    }
    if (origin === 'https://blog-api.twoneil.party' && !reqPublished) {
      item.attrs.src = getImageUrl(key, reqPublished);
    }

    return item;
  });

  const newJSONContent = {
    ...JSONContent,
    content: newContent,
  };

  return JSON.stringify(newJSONContent);
};

const deleteContentImages = async keys => {
  keys.forEach(async key => {
    const imageData = await getTempImage(key);

    await deleteFileFromR2(key, imageData.published);
    await deleteTempImage(key);
  });
};

const handleUpdatePostContentImageDelete = async (prevRawJson, currRawJson) => {
  const prevJson = JSON.parse(prevRawJson).content;
  const currJson = JSON.parse(currRawJson).content;
  const prevImageKeys = getImageKeysFromContent(prevJson);
  const currImageKeys = getImageKeysFromContent(currJson);
  const keysToDelete = prevImageKeys.filter(
    item => !currImageKeys.includes(item),
  );

  await deleteContentImages(keysToDelete);
};

const handleDeletePostContentImageDelete = async rawJson => {
  const json = JSON.parse(rawJson).content;
  const keys = getImageKeysFromContent(json);
  await deleteContentImages(keys);
};

const compressImage = async file => {
  try {
    const compressedImage = await sharp(file.buffer)
    .resize(1080, null, { withoutEnlargement: true })
    .toFormat('webp', { quality: 85, effort: 4, smartSubsample: true })
    .toBuffer();

    return compressedImage
  } catch (err) {
    throw createError('SERVER_ERROR', 'Image compress fail', 500)
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await postService.getAllPosts();
    const postsWithImageURL = posts.map(item => ({
      id: item.id,
      title: item.title,
      imageUrl: getImageUrl(item.imageKey, item.published),
      TEXTContent: item.TEXTContent,
      JSONContent: item.JSONContent,
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
    const postsWithImageURL = posts.map(item => ({
      id: item.id,
      title: item.title,
      imageUrl: getImageUrl(item.imageKey, true),
      TEXTContent: item.TEXTContent,
    }));

    res.json(postsWithImageURL);
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
    const postRes = {
      title: post.title,
      imageUrl: getImageUrl(post.imageKey, post.published),
      HTMLContent: post.HTMLContent,
      comments: post.comments,
    };

    res.json(postRes);
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const file = req.file;
    const published = JSON.parse(req.body.published);

    if (!file) {
      throw createError('FILE_ERROR', 'No file been upload.', 400);
    }

    const compressedImage = await compressImage(file.buffer);

    const imageKey = await uploadFileToR2(
      file.originalname,
      compressedImage,
      file.mimetype,
      published,
    );

    const newContent = await handleContentPublishedStatusChange(
      published,
      req.body.JSONContent,
    );

    const post = await postService.createPost({
      ...req.body,
      JSONContent: newContent,
      HTMLContent: tiptapConverter(newContent),
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
    const prevPost = await postService.getPostById(+req.params.id);
    const reqPublished = JSON.parse(req.body.published);
    const file = req.file;
    const id = +req.params.id;

    // 有新封面圖片上傳
    if (file) {
      const imageKey = await handleImageReplacement(
        file,
        reqPublished,
        prevPost,
      );
      const post = await postService.updatePost(id, {
        ...req.body,
        imageKey,
        published: reqPublished,
      });

      return res.json(post);
    }

    // 沒有新封面圖片上傳，但發布狀態變更
    if (prevPost.published !== reqPublished) {
      await handlePublishedStatusChange(prevPost.imageKey, reqPublished);
    }

    // 處理內文圖片刪減
    await handleUpdatePostContentImageDelete(
      prevPost.JSONContent,
      req.body.JSONContent,
    );

    // 處理內文發布狀態變更
    const newContent = await handleContentPublishedStatusChange(
      reqPublished,
      req.body.JSONContent,
    );

    // 更新貼文
    const post = await postService.updatePost(id, {
      ...req.body,
      JSONContent: newContent,
      HTMLContent: tiptapConverter(newContent),
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
    await handleDeletePostContentImageDelete(post.JSONContent);

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
      image.ContentType || 'application/octet-stream',
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

  const compressedImage = await compressImage(file.buffer);

  try {
    const imageKey = await uploadFileToR2(
      file.originalname,
      compressedImage,
      file.mimetype,
      false,
    );

    await createTempImage(imageKey);

    res.json({
      key: imageKey,
      url: getImageUrl(imageKey, false),
    });
  } catch (err) {
    next(err);
  }
};
