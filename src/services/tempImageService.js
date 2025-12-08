import prisma from '../utils/prisma.js';

export const createTempImage = async imageKey => {
  return await prisma.tempImage.create({
    data: {
      imageKey,
      isReferenced: false,
    },
  });
};
