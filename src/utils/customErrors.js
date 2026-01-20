export const createError = (name, msg, statusCode) => {
  const err = new Error(msg);
  err.name = name;
  err.statusCode = statusCode;
  return err;
};
