/**
 * Exceptions
 * ----------
 * Custom error classes for the AirTap Android SDK.
 */

/**
 * Base error class for all AirTap errors
 */
class AirTapError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AirTapError';
  }
}

/**
 * Error thrown when an API key is missing or invalid
 */
class ApiKeyError extends AirTapError {
  constructor(message) {
    super(message);
    this.name = 'ApiKeyError';
  }
}

/**
 * Error thrown when connection to the AirTap service fails
 */
class ConnectionError extends AirTapError {
  constructor(message) {
    super(message);
    this.name = 'ConnectionError';
  }
}

/**
 * Error thrown when a stream operation fails
 */
class StreamError extends AirTapError {
  constructor(message) {
    super(message);
    this.name = 'StreamError';
  }
}

/**
 * Error thrown when an app operation fails
 */
class AppError extends AirTapError {
  constructor(message) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error thrown when a recording operation fails
 */
class RecordError extends AirTapError {
  constructor(message) {
    super(message);
    this.name = 'RecordError';
  }
}

/**
 * Error thrown when a file operation fails
 */
class FileError extends AirTapError {
  constructor(message) {
    super(message);
    this.name = 'FileError';
  }
}

module.exports = {
  AirTapError,
  ApiKeyError,
  ConnectionError,
  StreamError,
  AppError,
  RecordError,
  FileError
};
