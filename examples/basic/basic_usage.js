/**
 * Basic usage example for AirTap Android SDK
 * Demonstrates how to create a sandbox and perform basic interactions
 */

// Import the AirTap SDK
const { AndroidSandbox } = require('../../index');

// Load environment variables from .env file
require('dotenv').config();

async function main() {
  try {
    console.log('Creating Android sandbox...');
    
    // Create a new Android sandbox
    const phone = await AndroidSandbox.create({
      resolution: [1080, 1920],
      dpi: 320,
      webrtc: true
    });
    
    console.log('Sandbox created successfully!');
    console.log(`Device ID: ${phone.deviceId}`);
    
    // Perform basic interactions
    console.log('Performing basic interactions...');
    
    // Wait for the screen to load
    await phone.wait(3000);
    
    // Unlock the device
    await phone.swipe([540, 1400], [540, 400], 300);
    await phone.wait(1000);
    
    // Open the app drawer
    await phone.tap([540, 1800]);
    await phone.wait(2000);
    
    // Take a screenshot
    console.log('Taking a screenshot...');
    const screenshotPath = await phone.screenshot();
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Execute a shell command
    console.log('Executing a shell command...');
    const result = await phone.executeShellCommand('pm list packages | grep google');
    console.log('Google packages installed:');
    console.log(result);
    
    // Clean up
    console.log('Cleaning up...');
    await phone.close();
    
    console.log('Example completed successfully!');
  } catch (error) {
    console.error('Error in example:', error);
  }
}

// Run the example
main();
