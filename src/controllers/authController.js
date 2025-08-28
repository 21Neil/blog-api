import { loginUser } from '../services/authService.js';

export const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const token = await loginUser(username, password);
    return res.status(200).json({ token });
  } catch (err) {
    next(err)
  }

};
