import prisma from '../utils/prisma.js';

export const getAllPosts = async () => {
  return await prisma.post.findMany({
    orderBy: {
      date: 'desc',
    },
  });
};

export const getPublishedPosts = async () => {
  return await prisma.post.findMany({
    where: {
      published: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
};

export const getPostById = async id => {
  return await prisma.post.findUnique({
    where: {
      id,
    },
  });
};

export const getPublishedPostById = async id => {
  return await prisma.post.findUnique({
    where: {
      id,
      published: true,
    },
    include: {
      comments: true,
    },
  });
};

export const createPost = async body => {
  return await prisma.post.create({
    data: {
      title: body.title,
      TEXTContent: body.TEXTContent,
      HTMLContent: body.HTMLContent,
      JSONContent: body.JSONContent,
      imageKey: body.imageKey,
      published: body.published,
      authorId: body.authorId,
    },
  });
};

export const updatePost = async (id, body) => {
  return await prisma.post.update({
    where: {
      id,
    },
    data: {
      title: body.title,
      TEXTContent: body.TEXTContent,
      HTMLContent: body.HTMLContent,
      JSONContent: body.JSONContent,
      imageKey: body.imageKey,
      published: body.published,
    },
  });
};

export const deletePost = async id => {
  return await prisma.post.delete({
    where: {
      id,
    },
  });
};
