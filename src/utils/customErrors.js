export const createAuthError = (message, statusCode = 401) => {
  const err = new Error(message);
  err.name = 'AuthError';
  err.statusCode = statusCode;
  return err;
};

export const createFileError = message => {
  const err = new Error(message);
  err.name = 'FileError';
  err.statusCode = 400;
  return err;
};
