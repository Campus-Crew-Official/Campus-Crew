import { sendError } from '../utils/response.js';
import { ENV } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return sendError(
      res,
      `A record with this ${fields} already exists. Duplicate entries are not permitted.`,
      409
    );
  }

  // Concurrency serialization failure (40001) or transaction conflict (P2034)
  if (err.code === 'P2034' || err.meta?.code === '40001') {
    return sendError(
      res,
      'Concurrent registration limit reached. Seat is no longer available.',
      409
    );
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return sendError(res, 'The requested resource was not found.', 404);
  }

  // JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Invalid JSON payload received.', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    message,
    statusCode,
    ENV.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};
