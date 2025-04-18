/**
 * Record Manager for AirTap Android SDK
 * Handles screen recording on the Android device
 */

const { v4: uuidv4 } = require('uuid');
const { RecordingError } = require('../exceptions');

class RecordManager {
  /**
   * Create a new record manager
   * @param {Object} sandbox - Reference to the parent AndroidSandbox
   */
  constructor(sandbox) {
    this.sandbox = sandbox;
    this.recordingId = null;
    this.isRecording = false;
    this.recordingStartTime = null;
  }

  /**
   * Start screen recording
   * @param {Object} options - Recording options
   * @param {number} options.width - Recording width
   * @param {number} options.height - Recording height
   * @param {number} options.bitRate - Recording bit rate in Mbps
   * @param {boolean} options.audio - Include audio in recording
   * @param {number} options.timeLimit - Recording time limit in seconds
   * @returns {Promise<string>} Recording ID
   */
  async start(options = { width: 1280, height: 720, bitRate: 8, audio: true, timeLimit: 180 }) {
    try {
      if (this.isRecording) {
        return this.recordingId;
      }
      
      // Generate a unique recording ID
      this.recordingId = uuidv4();
      
      // Build the command with options
      const audioOption = options.audio ? '--audio-source=mic' : '--audio-source=none';
      const timeLimitMs = options.timeLimit * 1000;
      
      // Start recording
      await this.sandbox.executeShellCommand(
        `screenrecord --size ${options.width}x${options.height} --bit-rate ${options.bitRate}M ${audioOption} --time-limit ${options.timeLimit} /sdcard/recording_${this.recordingId}.mp4`
      );
      
      this.isRecording = true;
      this.recordingStartTime = new Date();
      
      return this.recordingId;
    } catch (error) {
      throw new RecordingError(`Failed to start recording: ${error.message}`, error);
    }
  }

  /**
   * Stop screen recording
   * @returns {Promise<string>} Path to the recording file
   */
  async stop() {
    try {
      if (!this.isRecording) {
        throw new RecordingError('No active recording to stop');
      }
      
      // Android's screenrecord can only be stopped with a signal
      await this.sandbox.executeShellCommand('pkill -INT screenrecord');
      
      // Wait for the recording to finalize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.isRecording = false;
      const recordingPath = `/sdcard/recording_${this.recordingId}.mp4`;
      
      // Check if the file exists
      const exists = await this.sandbox.files.fileExists(recordingPath);
      if (!exists) {
        throw new RecordingError('Recording file not found');
      }
      
      return recordingPath;
    } catch (error) {
      throw new RecordingError(`Failed to stop recording: ${error.message}`, error);
    }
  }

  /**
   * Save the recording to the local machine
   * @param {string} localPath - Destination path on the local machine
   * @returns {Promise<boolean>} True if successful
   */
  async saveRecording(localPath) {
    try {
      if (this.isRecording) {
        throw new RecordingError('Cannot save while recording is in progress');
      }
      
      if (!this.recordingId) {
        throw new RecordingError('No recording available to save');
      }
      
      const recordingPath = `/sdcard/recording_${this.recordingId}.mp4`;
      
      // Pull the file
      await this.sandbox.files.pullFile(recordingPath, localPath);
      
      return true;
    } catch (error) {
      throw new RecordingError(`Failed to save recording to ${localPath}: ${error.message}`, error);
    }
  }

  /**
   * Get the status of the current recording
   * @returns {Object} Recording status
   */
  getStatus() {
    if (!this.isRecording && !this.recordingId) {
      return { isRecording: false, recordingId: null };
    }
    
    const status = {
      isRecording: this.isRecording,
      recordingId: this.recordingId
    };
    
    if (this.isRecording && this.recordingStartTime) {
      const now = new Date();
      status.duration = Math.floor((now - this.recordingStartTime) / 1000);
    }
    
    return status;
  }

  /**
   * Delete a recording from the device
   * @param {string} recordingId - ID of the recording to delete (defaults to the last recording)
   * @returns {Promise<boolean>} True if successful
   */
  async deleteRecording(recordingId = this.recordingId) {
    try {
      if (!recordingId) {
        throw new RecordingError('No recording ID provided');
      }
      
      if (this.isRecording && recordingId === this.recordingId) {
        throw new RecordingError('Cannot delete active recording');
      }
      
      const recordingPath = `/sdcard/recording_${recordingId}.mp4`;
      
      // Delete the file
      await this.sandbox.files.deleteFile(recordingPath);
      
      if (recordingId === this.recordingId) {
        this.recordingId = null;
      }
      
      return true;
    } catch (error) {
      throw new RecordingError(`Failed to delete recording: ${error.message}`, error);
    }
  }
}

module.exports = RecordManager;
