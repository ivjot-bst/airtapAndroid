/**
 * Complex automation example for AirTap Android SDK
 * Demonstrates a complete workflow across multiple apps
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
    
    // Start recording the session
    console.log('Starting screen recording...');
    await phone.record.start({
      width: 1080,
      height: 1920,
      bitRate: 8,
      audio: true,
      timeLimit: 300 // 5 minutes max
    });
    
    // Unlock the device
    await phone.swipe([540, 1400], [540, 400], 300);
    await phone.wait(1000);
    
    // Step 1: Open Chrome and navigate to a website
    console.log('Step 1: Opening Chrome and navigating to a website...');
    await phone.apps.launch('com.android.chrome');
    await phone.wait(3000);
    
    // Click on the address bar
    await phone.tap([540, 200]);
    await phone.wait(1000);
    
    // Type a URL
    await phone.inputText('example.com');
    await phone.wait(500);
    
    // Press Enter
    await phone.pressKey('KEYCODE_ENTER');
    await phone.wait(5000);
    
    // Take a screenshot
    console.log('Taking a screenshot of the website...');
    const screenshot1 = await phone.screenshot();
    console.log(`Screenshot saved to: ${screenshot1}`);
    
    // Step 2: Open the calculator app
    console.log('Step 2: Opening Calculator app...');
    await phone.pressKey('KEYCODE_HOME');
    await phone.wait(1000);
    await phone.apps.launch('com.android.calculator2');
    await phone.wait(2000);
    
    // Perform a calculation: 123 + 456 = 579
    await phone.tap([270, 1200]); // 1
    await phone.wait(200);
    await phone.tap([540, 1200]); // 2
    await phone.wait(200);
    await phone.tap([810, 1200]); // 3
    await phone.wait(200);
    await phone.tap([950, 1050]); // +
    await phone.wait(200);
    await phone.tap([270, 1050]); // 4
    await phone.wait(200);
    await phone.tap([540, 1050]); // 5
    await phone.wait(200);
    await phone.tap([810, 1050]); // 6
    await phone.wait(200);
    await phone.tap([950, 1350]); // =
    await phone.wait(1000);
    
    // Take a screenshot of the result
    console.log('Taking a screenshot of the calculation...');
    const screenshot2 = await phone.screenshot();
    console.log(`Screenshot saved to: ${screenshot2}`);
    
    // Step 3: Open a notes app and save the result
    console.log('Step 3: Opening Notes app and saving the result...');
    await phone.pressKey('KEYCODE_HOME');
    await phone.wait(1000);
    await phone.apps.launch('com.google.android.keep');
    await phone.wait(3000);
    
    // Create a new note
    await phone.tap([950, 1800]); // New note button (bottom-right)
    await phone.wait(2000);
    
    // Type a title
    await phone.tap([540, 300]); // Title field
    await phone.wait(500);
    await phone.inputText('Calculator Result');
    await phone.wait(500);
    
    // Type the note content
    await phone.tap([540, 600]); // Note content field
    await phone.wait(500);
    await phone.inputText('The result of 123 + 456 = 579');
    await phone.wait(1000);
    
    // Save the note
    await phone.pressKey('KEYCODE_BACK');
    await phone.wait(2000);
    
    // Step 4: Capture the final state and clean up
    console.log('Step 4: Finalizing automation...');
    
    // Take a final screenshot
    const screenshot3 = await phone.screenshot();
    console.log(`Final screenshot saved to: ${screenshot3}`);
    
    // Stop recording
    console.log('Stopping screen recording...');
    const recordingPath = await phone.record.stop();
    console.log(`Recording saved on device at: ${recordingPath}`);
    
    // Save the recording to the local machine
    const localRecordingPath = './complex_automation_recording.mp4';
    await phone.record.saveRecording(localRecordingPath);
    console.log(`Recording saved locally at: ${localRecordingPath}`);
    
    // Clean up
    console.log('Cleaning up...');
    await phone.close();
    
    console.log('Complex automation example completed successfully!');
  } catch (error) {
    console.error('Error in example:', error);
  }
}

// Run the example
main();
