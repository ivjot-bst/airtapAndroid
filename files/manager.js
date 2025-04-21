/**
 * File Manager for AirTap Android SDK
 * Handles file operations on the Android device
 */

const fs = require('fs');
const path = require('path');
const { FileError } = require('../exceptions');

class FileManager {
  /**
   * Create a new file manager
   * @param {Object} sandbox - Reference to the parent AndroidSandbox
   */
  constructor(sandbox) {
    this.sandbox = sandbox;
  }

  /**
   * List files in a directory on the Android device
   * @param {string} remotePath - Path on the Android device
   * @returns {Promise<Array>} List of files
   */
  async listFiles(remotePath) {
    try {
      const output = await this.sandbox.executeShellCommand(`ls -la ${remotePath}`);
      const lines = output.split('\n').filter(line => line.trim() !== '');
      
      // Skip the total line and parse the rest
      const files = lines.slice(1).map(line => {
        const parts = line.split(/\s+/);
        // Format: permissions, links, owner, group, size, date1, date2, time/year, name
        return {
          permissions: parts[0],
          owner: parts[2],
          group: parts[3],
          size: parseInt(parts[4], 10),
          date: `${parts[5]} ${parts[6]} ${parts[7]}`,
          name: parts.slice(8).join(' ')
        };
      });
      
      return files;
    } catch (error) {
      throw new FileError(`Failed to list files in ${remotePath}: ${error.message}`, error);
    }
  }

  /**
   * Push a file to the Android device
   * @param {string} localPath - Path on the local machine
   * @param {string} remotePath - Destination path on the Android device
   * @returns {Promise<boolean>} True if successful
   */
  async pushFile(localPath, remotePath) {
    try {
      if (!fs.existsSync(localPath)) {
        throw new FileError(`Local file ${localPath} does not exist`);
      }
      
      const fileContent = fs.readFileSync(localPath);
      const base64Content = fileContent.toString('base64');
      
      // Use the API to push the file
      await this.sandbox.apiClient.post('/files/push', {
        deviceId: this.sandbox.deviceId,
        path: remotePath,
        content: base64Content
      });
      
      return true;
    } catch (error) {
      throw new FileError(`Failed to push file ${localPath} to ${remotePath}: ${error.message}`, error);
    }
  }

  /**
   * Pull a file from the Android device
   * @param {string} remotePath - Path on the Android device
   * @param {string} localPath - Destination path on the local machine
   * @returns {Promise<boolean>} True if successful
   */
  async pullFile(remotePath, localPath) {
    try {
      // Use the API to pull the file
      const response = await this.sandbox.apiClient.get('/files/pull', {
        deviceId: this.sandbox.deviceId,
        path: remotePath
      });
      
      const buffer = Buffer.from(response.content, 'base64');
      
      // Ensure the directory exists
      const dir = path.dirname(localPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(localPath, buffer);
      return true;
    } catch (error) {
      throw new FileError(`Failed to pull file ${remotePath} to ${localPath}: ${error.message}`, error);
    }
  }

  /**
   * Delete a file on the Android device
   * @param {string} remotePath - Path on the Android device
   * @returns {Promise<boolean>} True if successful
   */
  async deleteFile(remotePath) {
    try {
      await this.sandbox.executeShellCommand(`rm -f ${remotePath}`);
      return true;
    } catch (error) {
      throw new FileError(`Failed to delete file ${remotePath}: ${error.message}`, error);
    }
  }

  /**
   * Create a directory on the Android device
   * @param {string} remotePath - Path on the Android device
   * @returns {Promise<boolean>} True if successful
   */
  async createDirectory(remotePath) {
    try {
      await this.sandbox.executeShellCommand(`mkdir -p ${remotePath}`);
      return true;
    } catch (error) {
      throw new FileError(`Failed to create directory ${remotePath}: ${error.message}`, error);
    }
  }

  /**
   * Check if a file exists on the Android device
   * @param {string} remotePath - Path on the Android device
   * @returns {Promise<boolean>} True if exists
   */
  async fileExists(remotePath) {
    try {
      const output = await this.sandbox.executeShellCommand(`[ -e ${remotePath} ] && echo "exists" || echo "not exists"`);
      return output.trim() === 'exists';
    } catch (error) {
      throw new FileError(`Failed to check if file ${remotePath} exists: ${error.message}`, error);
    }
  }
}

module.exports = FileManager;
