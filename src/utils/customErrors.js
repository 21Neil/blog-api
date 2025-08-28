export const createAuthError = message => {
  const err = new Error(message);
  err.name = 'AuthError';
  err.statusCode = 401;
  return err;
};
