import prisma from '../utils/prisma.js';

export const getAllPosts = async () => {
  return await prisma.post.findMany();
};

export const getPublishedPosts = async () => {
  return await prisma.post.findMany({
    where: {
      published: true,
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

export const createPost = async body => {
  return await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
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
      content: body.content,
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
