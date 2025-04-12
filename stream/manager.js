/**
 * Stream Manager for AirTap Android SDK
 * Handles WebRTC streaming of the Android device screen
 */

const { v4: uuidv4 } = require('uuid');
const { StreamError } = require('../exceptions');

class StreamManager {
  /**
   * Create a new stream manager
   * @param {Object} sandbox - Reference to the parent AndroidSandbox
   */
  constructor(sandbox) {
    this.sandbox = sandbox;
    this.streamId = null;
    this.streamUrl = null;
    this.isStreaming = false;
  }

  /**
   * Start streaming the Android device screen
   * @param {Object} options - Streaming options
   * @param {number} options.quality - Stream quality (1-10)
   * @param {boolean} options.audio - Include audio in the stream
   * @returns {Promise<string>} Stream URL
   */
  async start(options = { quality: 8, audio: true }) {
    try {
      if (this.isStreaming) {
        return this.streamUrl;
      }

      // Generate a unique stream ID
      this.streamId = uuidv4();
      
      // Request a new stream from the API
      const response = await this.sandbox.apiClient.post('/stream', {
        deviceId: this.sandbox.deviceId,
        streamId: this.streamId,
        quality: options.quality,
        audio: options.audio
      });
      
      this.streamUrl = response.streamUrl;
      this.isStreaming = true;
      
      return this.streamUrl;
    } catch (error) {
      throw new StreamError(`Failed to start stream: ${error.message}`, error);
    }
  }

  /**
   * Stop streaming the Android device screen
   * @returns {Promise<boolean>} True if successful
   */
  async stop() {
    try {
      if (!this.isStreaming) {
        return true;
      }
      
      // Request to stop the stream
      await this.sandbox.apiClient.delete(`/stream/${this.streamId}`);
      
      this.isStreaming = false;
      this.streamUrl = null;
      
      return true;
    } catch (error) {
      throw new StreamError(`Failed to stop stream: ${error.message}`, error);
    }
  }

  /**
   * Get the current stream status
   * @returns {Promise<Object>} Stream status
   */
  async getStatus() {
    try {
      if (!this.isStreaming || !this.streamId) {
        return { isStreaming: false };
      }
      
      const status = await this.sandbox.apiClient.get(`/stream/${this.streamId}/status`);
      return {
        isStreaming: status.active,
        viewers: status.viewers,
        startTime: status.startTime,
        quality: status.quality
      };
    } catch (error) {
      throw new StreamError(`Failed to get stream status: ${error.message}`, error);
    }
  }

  /**
   * Update stream settings
   * @param {Object} options - Stream options to update
   * @param {number} options.quality - Stream quality (1-10)
   * @param {boolean} options.audio - Include audio in the stream
   * @returns {Promise<boolean>} True if successful
   */
  async updateSettings(options = {}) {
    try {
      if (!this.isStreaming || !this.streamId) {
        throw new StreamError('No active stream to update');
      }
      
      await this.sandbox.apiClient.put(`/stream/${this.streamId}`, options);
      return true;
    } catch (error) {
      throw new StreamError(`Failed to update stream settings: ${error.message}`, error);
    }
  }
}

module.exports = StreamManager;
