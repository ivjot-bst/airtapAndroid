/**
 * AirTap Android
 * -------------
 * Cloud-controlled virtual Android environment for LLM-orchestrated mobile workflows.
 * 
 * This module provides a JavaScript interface to interact with virtual Android devices
 * running in the cloud, enabling automation of mobile tasks through AI agents.
 */

const { AndroidSandbox } = require('./sandbox');

// Expose the main classes
module.exports = {
  AndroidSandbox
};
