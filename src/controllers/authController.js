import { loginUser } from '../services/authService.js';

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
