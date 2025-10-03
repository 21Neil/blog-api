export const createAuthError = message => {
  const err = new Error(message);
  err.name = 'AuthError';
  err.statusCode = 401;
  return err;
};

export const createFileError = message => {
  const err = new Error(message);
  err.name = 'FileError';
  err.statusCode = 400;
  return err;
};
