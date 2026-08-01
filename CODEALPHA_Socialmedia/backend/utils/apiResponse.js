export const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}, pagination = null) => {
  const responseObj = { success: true, message, data };
  if (pagination) responseObj.pagination = pagination;
  return res.status(statusCode).json(responseObj);
};

export const sendError = (res, statusCode = 500, message = 'Internal Server Error', error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? (error.message || error) : null
  });
};
