/**
 * AndroidSandbox
 * -------------
 * The main interface to interact with a virtual Android device in the cloud.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const StreamManager = require('./stream/manager');
const AppManager = require('./apps/manager');
const RecordManager = require('./record/manager');
const FileManager = require('./files/manager');
const { AirTapError, ApiKeyError, ConnectionError } = require('./exceptions');

/**
 * Main class for interacting with a virtual Android device in the cloud.
 * 
 * Provides methods for:
 * - Touch and gesture control
 * - Keyboard input
 * - App management
 * - Screenshot and screen recording
 * - File transfer
 * - Shell command execution
 */
class AndroidSandbox {
  /**
   * Initialize a new virtual Android device.
   * 
   * @param {Object} options - Configuration options
   * @param {Array<number>} [options.resolution=[1280, 720]] - Screen resolution as [width, height] array
   * @param {number} [options.dpi=160] - Screen density (dots per inch)
   * @param {boolean} [options.webrtc=false] - Enable WebRTC streaming
   * @param {number} [options.memory_mb=2048] - VM memory in megabytes
   * @param {string} [options.api_key] - AirTap API key (defaults to AIRTAP_API_KEY env variable)
   * @throws {ApiKeyError} If no API key is provided or found in environment
   * @throws {ConnectionError} If connection to the cloud service fails
   */
  constructor({ 
    resolution = [1280, 720], 
    dpi = 160, 
    webrtc = false, 
    memory_mb = 2048, 
    api_key = null 
  } = {}) {
    this.api_key = api_key || process.env.AIRTAP_API_KEY;
    if (!this.api_key) {
      throw new ApiKeyError("No API key provided. Set AIRTAP_API_KEY environment variable or pass api_key parameter.");
    }
    
    this.resolution = resolution;
    this.dpi = dpi;
    this.memory_mb = memory_mb;
    
    // Initialize managers
    this.stream = new StreamManager(this);
    this.apps = new AppManager(this);
    this.record = new RecordManager(this);
    this.files = new FileManager(this);
    
    // Enable WebRTC if requested
    if (webrtc) {
      this.stream.enableWebrtc();
    }
    
    // Will be initialized during create() call
    this._device_id = null;
  }

  /**
   * Create a new AndroidSandbox instance asynchronously
   * 
   * @param {Object} options - Configuration options (see constructor)
   * @returns {Promise<AndroidSandbox>} A fully initialized AndroidSandbox instance
   */
  static async create(options = {}) {
    const sandbox = new AndroidSandbox(options);
    // Initialize device connection
    await sandbox._initializeDevice();
    return sandbox;
  }
  
  /**
   * Initialize the connection to a virtual Android device.
   * 
   * @private
   * @returns {Promise<string>} Device ID for subsequent API calls
   * @throws {ConnectionError} If connection fails
   */
  async _initializeDevice() {
    // Generate a unique session ID for this device
    const session_id = uuidv4();
    
    // Prepare request payload
    const payload = {
      resolution: this.resolution,
      dpi: this.dpi,
      memory_mb: this.memory_mb,
      session_id: session_id,
      android_version: "13",
      device_model: "Pixel 4"
    };
    
    // Build API endpoint URL
    const api_url = "https://api.airtap.ai/v1/devices";
    
    // Set up authentication headers
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json",
      "X-Client-Version": "1.0.0" // Replace with package.version
    };
    
    try {
      // Make API request to provision a device
      const response = await axios.post(api_url, payload, { headers, timeout: 60000 });
      
      // Check for successful response
      if (response.status === 201) {
        const result = response.data;
        const device_id = result.device_id;
        if (!device_id) {
          throw new ConnectionError("Missing device_id in API response");
        }
        this._device_id = device_id;
        return device_id;
      } else {
        let error_msg = `Failed to initialize device: ${response.status}`;
        if (response.data && response.data.error) {
          error_msg = `Failed to initialize device: ${response.data.error}`;
        }
        throw new ConnectionError(error_msg);
      }
    } catch (e) {
      if (e.response) {
        // The request was made and the server responded with a status code outside of 2xx
        let error_msg = `Failed to initialize device: ${e.response.status}`;
        if (e.response.data && e.response.data.error) {
          error_msg = `Failed to initialize device: ${e.response.data.error}`;
        }
        throw new ConnectionError(error_msg);
      } else if (e.request) {
        // The request was made but no response was received
        throw new ConnectionError(`Connection error when initializing device: No response received`);
      } else {
        // Something happened in setting up the request
        throw new ConnectionError(`Connection error when initializing device: ${e.message}`);
      }
    }
  }
  
  /**
   * Perform a tap gesture at the specified coordinates.
   * 
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Promise<void>}
   */
  async tap(x, y) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/input/tap`;
    
    const payload = {
      x: x,
      y: y
    };
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, payload, { headers, timeout: 10000 });
      
      if (response.status !== 200) {
        console.warn(`Warning: Tap operation returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(`Error performing tap: ${e.message}`);
    }
  }
  
  /**
   * Perform a double tap gesture at the specified coordinates.
   * 
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Promise<void>}
   */
  async doubleTap(x, y) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/input/double_tap`;
    
    const payload = {
      x: x,
      y: y
    };
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, payload, { headers, timeout: 10000 });
      
      if (response.status !== 200) {
        console.warn(`Warning: Double tap operation returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(`Error performing double tap: ${e.message}`);
    }
  }
  
  /**
   * Perform a swipe gesture from start to end coordinates.
   * 
   * @param {Array<number>} start - Starting [x, y] coordinates
   * @param {Array<number>} end - Ending [x, y] coordinates
   * @param {number} [duration_ms=500] - Duration of swipe in milliseconds
   * @returns {Promise<void>}
   */
  async swipe(start, end, duration_ms = 500) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/input/swipe`;
    
    const payload = {
      start_x: start[0],
      start_y: start[1],
      end_x: end[0],
      end_y: end[1],
      duration_ms: duration_ms
    };
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, payload, { headers, timeout: 10000 });
      
      if (response.status !== 200) {
        console.warn(`Warning: Swipe operation returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(`Error performing swipe: ${e.message}`);
    }
  }
  
  /**
   * Perform a long press gesture at the specified coordinates.
   * 
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} [duration_ms=1000] - Duration of press in milliseconds
   * @returns {Promise<void>}
   */
  async longPress(x, y, duration_ms = 1000) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/input/long_press`;
    
    const payload = {
      x: x,
      y: y,
      duration_ms: duration_ms
    };
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, payload, { headers, timeout: 10000 });
      
      if (response.status !== 200) {
        console.warn(`Warning: Long press operation returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(`Error performing long press: ${e.message}`);
    }
  }
  
  /**
   * Perform a pinch out (zoom in) gesture.
   * 
   * @param {Array<number>} center - Center [x, y] coordinates of the pinch
   * @param {number} distance - Distance to pinch in pixels
   * @returns {Promise<void>}
   */
  async pinchOut(center, distance) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/input/pinch`;
    
    const payload = {
      center_x: center[0],
      center_y: center[1],
      distance: distance,
      direction: "out"  // out for zoom in, in for zoom out
    };
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, payload, { headers, timeout: 10000 });
      
      if (response.status !== 200) {
        console.warn(`Warning: Pinch out operation returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(`Error performing pinch out: ${e.message}`);
    }
  }
  
  /**
   * Type text on the virtual keyboard.
   * 
   * @param {string} text - Text to type
   * @returns {Promise<void>}
   */
  async typeText(text) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/input/text`;
    
    const payload = {
      text: text
    };
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, payload, { headers, timeout: 15000 });
      
      if (response.status !== 200) {
        console.warn(`Warning: Type text operation returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(`Error typing text: ${e.message}`);
    }
  }
  
  /**
   * Press a special key on the virtual keyboard.
   * 
   * @param {string} key - Key to press (e.g., "ENTER", "HOME", "BACK")
   * @returns {Promise<void>}
   */
  async pressKey(key) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/input/key`;
    
    const payload = {
      key: key
    };
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, payload, { headers, timeout: 10000 });
      
      if (response.status !== 200) {
        console.warn(`Warning: Press key operation returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(`Error pressing key: ${e.message}`);
    }
  }
  
  /**
   * Press a combination of keys simultaneously.
   * 
   * @param {Array<string>} keys - List of keys to press together
   * @returns {Promise<void>}
   */
  async pressCombo(keys) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/input/combo`;
    
    const payload = {
      keys: keys
    };
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, payload, { headers, timeout: 10000 });
      
      if (response.status !== 200) {
        console.warn(`Warning: Press combo operation returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(`Error pressing key combination: ${e.message}`);
    }
  }
  
  /**
   * Take a screenshot of the current screen.
   * 
   * @returns {Promise<Buffer>} Screenshot image data as Buffer
   */
  async screenshot() {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/screenshot`;
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Accept": "application/json"
    };
    
    try {
      const response = await axios.get(api_url, { headers, timeout: 30000 });
      
      if (response.status === 200) {
        const result = response.data;
        if (result.image_data) {
          // Decode base64-encoded image
          return Buffer.from(result.image_data, 'base64');
        } else if (result.image_url) {
          // Download image from URL
          const imageResponse = await axios.get(result.image_url, { 
            responseType: 'arraybuffer',
            timeout: 30000 
          });
          if (imageResponse.status === 200) {
            return Buffer.from(imageResponse.data);
          } else {
            console.warn(`Warning: Failed to download screenshot from URL: ${imageResponse.status}`);
            return Buffer.alloc(0);
          }
        }
      } else {
        console.warn(`Warning: Screenshot operation returned status code ${response.status}`);
        return Buffer.alloc(0);
      }
    } catch (e) {
      console.error(`Error taking screenshot: ${e.message}`);
      return Buffer.alloc(0);
    }
  }
  
  /**
   * Run a shell command on the device.
   * 
   * @param {string} command - Shell command to execute
   * @returns {Promise<string>} Command output as string
   */
  async shell(command) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/shell`;
    
    const payload = {
      command: command
    };
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, payload, { headers, timeout: 30000 });
      
      if (response.status === 200) {
        const result = response.data;
        return result.output || "";
      } else {
        console.warn(`Warning: Shell command operation returned status code ${response.status}`);
        return "";
      }
    } catch (e) {
      console.error(`Error executing shell command: ${e.message}`);
      return "";
    }
  }
  
  /**
   * Wait for an app to become active.
   * 
   * @param {string} package_name - App package name
   * @param {number} [timeout_ms=5000] - Timeout in milliseconds
   * @returns {Promise<boolean>} True if app became active, False if timeout
   */
  async waitForApp(package_name, timeout_ms = 5000) {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/current_app`;
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Accept": "application/json"
    };
    
    // Calculate end time for timeout
    const end_time = Date.now() + timeout_ms;
    
    // Poll for current app until it matches or timeout
    while (Date.now() < end_time) {
      try {
        const response = await axios.get(api_url, { headers, timeout: 10000 });
        
        if (response.status === 200) {
          const result = response.data;
          const current_app = result.package_name || "";
          
          // Check if current app matches target package
          if (current_app === package_name) {
            return true;
          }
        } else {
          console.warn(`Warning: Current app check returned status code ${response.status}`);
        }
      } catch (e) {
        console.error(`Error checking current app: ${e.message}`);
      }
      
      // Wait before next poll
      await this.wait(500);
    }
    
    // Timeout reached
    return false;
  }
  
  /**
   * Wait for the specified duration.
   * 
   * @param {number} duration_ms - Duration to wait in milliseconds
   * @returns {Promise<void>}
   */
  async wait(duration_ms) {
    return new Promise(resolve => setTimeout(resolve, duration_ms));
  }
  
  /**
   * Close the connection and release resources.
   * 
   * @returns {Promise<void>}
   */
  async close() {
    const api_url = `https://api.airtap.ai/v1/devices/${this._device_id}/release`;
    
    const headers = {
      "Authorization": `Bearer ${this.api_key}`,
      "Content-Type": "application/json"
    };
    
    try {
      const response = await axios.post(api_url, {}, { headers, timeout: 30000 });
      
      if (response.status !== 200 && response.status !== 204) {
        console.warn(`Warning: Device release operation returned status code ${response.status}`);
      }
    } catch (e) {
      console.error(`Error releasing device: ${e.message}`);
    }
    
    // Clear cached references
    this._device_id = null;
  }
}

module.exports = { AndroidSandbox };
