/**
 * App installation and management example for AirTap Android SDK
 * Demonstrates how to install, launch, and manage apps
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
      dpi: 320
    });
    
    console.log('Sandbox created successfully!');
    console.log(`Device ID: ${phone.deviceId}`);
    
    // Define the package name of the app to install
    const packageName = 'com.spotify.music';
    
    // Check if the app is already installed
    const isInstalled = await phone.apps.isInstalled(packageName);
    console.log(`Is ${packageName} installed? ${isInstalled}`);
    
    if (!isInstalled) {
      // Install the app
      console.log(`Installing ${packageName}...`);
      await phone.apps.install(packageName);
      console.log(`${packageName} installed successfully!`);
    }
    
    // Launch the app
    console.log(`Launching ${packageName}...`);
    await phone.apps.launch(packageName);
    console.log(`${packageName} launched!`);
    
    // Wait for the app to load
    await phone.wait(5000);
    
    // Take a screenshot
    const screenshotPath = await phone.screenshot();
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Perform some interactions with the app
    // For demonstration, we'll just tap in a few locations
    await phone.tap([540, 500]);
    await phone.wait(1000);
    await phone.tap([540, 800]);
    await phone.wait(1000);
    
    // Force stop the app
    console.log(`Force stopping ${packageName}...`);
    await phone.apps.forceStop(packageName);
    console.log(`${packageName} stopped!`);
    
    // Optional: Uninstall the app
    // console.log(`Uninstalling ${packageName}...`);
    // await phone.apps.uninstall(packageName);
    // console.log(`${packageName} uninstalled!`);
    
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
