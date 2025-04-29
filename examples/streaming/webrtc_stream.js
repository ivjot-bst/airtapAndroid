/**
 * WebRTC streaming example for AirTap Android SDK
 * Demonstrates how to start and control a WebRTC stream
 */

// Import the AirTap SDK
const { AndroidSandbox } = require('../../index');

// Load environment variables from .env file
require('dotenv').config();

async function main() {
  try {
    console.log('Creating Android sandbox...');
    
    // Create a new Android sandbox with WebRTC enabled
    const phone = await AndroidSandbox.create({
      resolution: [1080, 1920],
      dpi: 320,
      webrtc: true
    });
    
    console.log('Sandbox created successfully!');
    console.log(`Device ID: ${phone.deviceId}`);
    
    // Start WebRTC stream
    console.log('Starting WebRTC stream...');
    const streamUrl = await phone.stream.start({
      quality: 9,
      audio: true
    });
    
    console.log(`Stream started! URL: ${streamUrl}`);
    console.log('Stream will be active for 30 seconds...');
    
    // Perform some interactions while streaming
    await phone.wait(3000);
    
    // Unlock the device
    await phone.swipe([540, 1400], [540, 400], 300);
    await phone.wait(1000);
    
    // Open the app drawer
    await phone.tap([540, 1800]);
    await phone.wait(2000);
    
    // Check stream status
    const status = await phone.stream.getStatus();
    console.log('Stream status:', status);
    
    // Keep the stream active for demonstration
    await phone.wait(20000);
    
    // Stop the stream
    console.log('Stopping stream...');
    await phone.stream.stop();
    console.log('Stream stopped');
    
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
