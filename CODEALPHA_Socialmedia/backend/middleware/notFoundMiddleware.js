import { sendError } from '../utils/apiResponse.js';
const notFoundMiddleware = (req, res, next) => sendError(res, 404, `API Route Not Found - [${req.method}] ${req.originalUrl}`);
export default notFoundMiddleware;
