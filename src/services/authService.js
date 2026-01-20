import prisma from '../utils/prisma.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createError } from '../utils/customErrors.js';

export const loginUser = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  const isPasswordValid = user
    ? await bcryptjs.compare(password, user.password)
    : false;

  if (!user || !isPasswordValid)
    throw createError('AUTH_ERROR', 'Invalid user or password.', 401);

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export const changeUserPassword = async (id, password) => {
  const hashedPassword = await bcryptjs.hash(password, 10);

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      password: hashedPassword,
    },
  });
};
