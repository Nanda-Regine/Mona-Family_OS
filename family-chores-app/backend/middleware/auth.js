'use strict';

/**
 * Device ID validation middleware.
 * Requires X-Device-ID header or deviceId in request body.
 * In development mode, allows requests without device ID.
 */
function validateDeviceId(req, res, next) {
  const deviceId =
    req.headers['x-device-id'] ||
    req.body?.deviceId ||
    req.query?.deviceId;

  if (!deviceId) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        error: 'Missing device ID',
        message: 'Please provide X-Device-ID header'
      });
    }
    // In development, attach a default device ID
    req.deviceId = 'dev-device';
    return next();
  }

  // Basic validation: device ID must be a non-empty string, max 128 chars
  if (typeof deviceId !== 'string' || deviceId.trim().length === 0 || deviceId.length > 128) {
    return res.status(400).json({
      error: 'Invalid device ID',
      message: 'Device ID must be a string between 1 and 128 characters'
    });
  }

  req.deviceId = deviceId.trim();
  next();
}

module.exports = { validateDeviceId };
