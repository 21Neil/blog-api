import { changeUserPassword, loginUser } from '../services/authService.js';
import { createAuthError } from '../utils/customErrors.js';
import bcrypt from 'bcryptjs';
import z from 'zod';

const passwordSchema = z
  .string()
  .min(8, '密碼最少8字元')
  .max(15, '密碼最多15字元')
  .refine(password => /[A-Z]/.test(password), '密碼最少需要一個大寫字母')
  .refine(password => /[a-z]/.test(password), '密碼最少需要一個小寫字母')
  .refine(password => /[0-9]/.test(password), '密碼最少需要一個數字')
  .refine(
    password => /[!@#$%^&*]/.test(password),
    '密碼需要包含以下一個!@#$%^&*字元'
  )
  .trim();

export const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const token = await loginUser(username, password);
    return res
      .status(201)
      .cookie('Authorization', token, {
        httpOnly: true,
        maxAge: 86400000,
        sameSite: 'none',
        secure: true,
      })
      .json('Login success');
  } catch (err) {
    next(err);
  }
};

export const checkLogin = async (req, res, next) => {
  if (req.user) return res.json({ isLogin: true });
  if (!req.user) return res.json({ isLogin: false });
};

export const logout = async (req, res, next) => {
  try {
    return res
      .status(200)
      .clearCookie('Authorization', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      .json('Logout success');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  const { password, newPassword } = req.body;

  try {
    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) throw createAuthError(validation.error.issues[0].message, 400)

    if (password === newPassword) throw createAuthError('新密碼不能與舊密碼相同', 400)

    const isPasswordValid = await bcrypt.compare(password, req.user.password);
    if (!isPasswordValid) throw createAuthError('Invalid password.');

    await changeUserPassword(req.user.id, req.body.newPassword);

    return res
      .status(200)
      .clearCookie('Authorization', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      .json('Change success');
  } catch (err) {
    next(err);
  }
};
