/**
 * App Manager for AirTap Android SDK
 * Handles installing, launching, and managing Android applications
 */

const { AppError } = require('../exceptions');

class AppManager {
  /**
   * Create a new app manager
   * @param {Object} sandbox - Reference to the parent AndroidSandbox
   */
  constructor(sandbox) {
    this.sandbox = sandbox;
  }

  /**
   * Install an app from the Google Play Store
   * @param {string} packageName - Package name of the app to install
   * @returns {Promise<boolean>} True if successful
   */
  async install(packageName) {
    try {
      await this.sandbox.executeShellCommand(`pm install-existing ${packageName}`);
      const isInstalled = await this.isInstalled(packageName);
      if (!isInstalled) {
        await this.sandbox.executeShellCommand(`am start -a android.intent.action.VIEW -d market://details?id=${packageName}`);
        // Wait for installation to complete
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
      return await this.isInstalled(packageName);
    } catch (error) {
      throw new AppError(`Failed to install app ${packageName}: ${error.message}`, error);
    }
  }

  /**
   * Launch an installed app
   * @param {string} packageName - Package name of the app to launch
   * @returns {Promise<boolean>} True if successful
   */
  async launch(packageName) {
    try {
      if (!await this.isInstalled(packageName)) {
        throw new AppError(`App ${packageName} is not installed`);
      }
      
      // Get the main activity of the package
      const output = await this.sandbox.executeShellCommand(`cmd package resolve-activity --brief ${packageName}`);
      const match = output.match(/^\s*([^\s]+)\s*$/m);
      
      if (!match || !match[1]) {
        throw new AppError(`Could not find main activity for ${packageName}`);
      }
      
      const activity = match[1];
      await this.sandbox.executeShellCommand(`am start -n ${activity}`);
      return true;
    } catch (error) {
      throw new AppError(`Failed to launch app ${packageName}: ${error.message}`, error);
    }
  }

  /**
   * Check if an app is installed
   * @param {string} packageName - Package name to check
   * @returns {Promise<boolean>} True if installed
   */
  async isInstalled(packageName) {
    try {
      const output = await this.sandbox.executeShellCommand(`pm list packages ${packageName}`);
      return output.includes(`package:${packageName}`);
    } catch (error) {
      throw new AppError(`Failed to check if app ${packageName} is installed: ${error.message}`, error);
    }
  }

  /**
   * Uninstall an app
   * @param {string} packageName - Package name to uninstall
   * @returns {Promise<boolean>} True if successful
   */
  async uninstall(packageName) {
    try {
      if (!await this.isInstalled(packageName)) {
        return true; // Already uninstalled
      }
      
      await this.sandbox.executeShellCommand(`pm uninstall ${packageName}`);
      return !(await this.isInstalled(packageName));
    } catch (error) {
      throw new AppError(`Failed to uninstall app ${packageName}: ${error.message}`, error);
    }
  }

  /**
   * Force stop an app
   * @param {string} packageName - Package name to stop
   * @returns {Promise<boolean>} True if successful
   */
  async forceStop(packageName) {
    try {
      await this.sandbox.executeShellCommand(`am force-stop ${packageName}`);
      return true;
    } catch (error) {
      throw new AppError(`Failed to force stop app ${packageName}: ${error.message}`, error);
    }
  }

  /**
   * Clear app data
   * @param {string} packageName - Package name to clear data for
   * @returns {Promise<boolean>} True if successful
   */
  async clearData(packageName) {
    try {
      await this.sandbox.executeShellCommand(`pm clear ${packageName}`);
      return true;
    } catch (error) {
      throw new AppError(`Failed to clear data for app ${packageName}: ${error.message}`, error);
    }
  }
}

module.exports = AppManager;
