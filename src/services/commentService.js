import prisma from '../utils/prisma.js';

export const getCommentByPostId = async id => {
  return prisma.comment.findMany({
    where: {
      postId: id,
    }
  });
};

export const createComment = async (id, body) => {
  return prisma.comment.create({
    data: {
      name: body.name,
      content: body.content,
      postId: id,
    },
  });
};

export const deleteComment = async id => {
  return prisma.comment.delete({
    where: {
      id,
    },
  });
};
