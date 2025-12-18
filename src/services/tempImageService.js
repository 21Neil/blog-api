import prisma from '../utils/prisma.js';

export const createTempImage = async imageKey => {
  return await prisma.tempImage.create({
    data: {
      id: imageKey,
    },
  });
};

export const updateTempImage = async (imageKey, body) => {
  return await prisma.tempImage.update({
    where: {
      id: imageKey,
    },
    data: {
      referenced: body.referenced,
      published: body.published,
    },
  });
};

export const getTempImage = async imageKey => {
  return await prisma.tempImage.findUnique({
    where: {
      id: imageKey,
    },
  });
};

export const deleteTempImage = async imageKey => {
  return await prisma.tempImage.delete({
    where: {
      id: imageKey,
    },
  });
};
