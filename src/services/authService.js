import prisma from '../utils/prisma.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAuthError } from '../utils/customErrors.js';

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
    throw createAuthError('Invalid user or password.');

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};
