# AirTap V1
Cloud-controlled virtual Android environment for LLM-orchestrated mobile workflows

## 📱 What is AirTap?

AirTap is a cloud-based platform that provides virtual Android environments controlled by AI agents. Instead of manually interacting with mobile apps, AirTap's AI agents intelligently operate Android applications on your behalf, executing complex workflows across multiple apps without requiring physical devices or manual intervention.

An "airtap" is a virtual, intelligent tap, swipe, or key-press triggered by an LLM agent in the cloud. The AI agent analyzes screens, understands context, and makes decisions about where and when to interact—just like a human would, but with the efficiency and precision of automation.

## ✨ Key Features

### 🧠 AI-Powered Interaction
- Intelligent virtual touches: AI decides where/when to tap, swipe, or type
- Visual understanding: LLMs analyze screen content to comprehend interface context
- Autonomous decision-making: Agents navigate complex app flows without predefined paths
- Natural language instructions: Define tasks in plain English instead of writing code

### ☁️ Cloud-Native Android
- Fully virtualized: Complete Android environments running in isolated cloud VMs
- Off-device execution: Actions execute inside secure sandboxes; your local devices stay untouched
- Multiple device profiles: Different Android versions, screen sizes, and configurations
- Scalable infrastructure: Run multiple instances simultaneously for parallel workflows

### 🔄 Cross-App Workflows
- Seamless transitions: The same agent can operate across multiple applications
- Data sharing: Transfer information between apps as part of workflows
- Persistent context: Maintain understanding throughout multi-step processes

## 🔍 Airtap Android Sandbox

`@airtap/android` provides a fully isolated Android Virtual Machine (VM), currently running Android 13 (API 33). This allows your code or LLM agents to stream, inspect, and control the Android environment for mobile tasks.

### Open‑source projects to use Sandbox to control Android apps
- Python - https://github.com/ivjot-bst/airtap_android
- JavaScript - https://github.com/ivjot-bst/airtapAndroid

## 🚀 Getting Started

### 1. Get Your AirTap API Key
```bash
# Create an account at https://airtap.ai/
→ copy your key → set environment variable
export AIRTAP_API_KEY="<your-key>"
```

### 2. Clone the Repository
```bash
# Clone the AirTap JS repository
git clone https://github.com/ivjot-bst/airtapAndroid
cd airtapAndroid
npm install
```

### 3. Create Your First Virtual Device
```javascript
import { AndroidSandbox } from '@airtap/android'

// Basic
const phone = await AndroidSandbox.create()

// Custom
const phone = await AndroidSandbox.create({
  resolution: [1440, 3040],
  dpi: 320,
  webrtc: true
})
```

## Features & Usage Examples

### WebRTC Live Streaming

```javascript
// Stream the device screen
const url = await phone.stream.start();
console.log(`View device at: ${url}`);

// Disable user input for view-only mode
const viewOnlyUrl = await phone.stream.start({ viewOnly: true });

// Stop streaming
await phone.stream.stop();
```

### Low-Level Device Control

When you need precise control over individual actions:

```javascript
// Manual control operations
import { AndroidSandbox } from '@airtap/android';
const phone = await AndroidSandbox.create();

// Touch & gesture control
await phone.tap(300, 900);
await phone.doubleTap(500, 500);
await phone.swipe([100, 1600], [100, 400], 600);
await phone.longPress(540, 960, 1200);
await phone.pinchOut([540, 960], 300);

// Keyboard input
await phone.typeText("Hello world");
await phone.pressKey("ENTER");
await phone.pressCombo(["CTRL", "A"]);

// App management
await phone.apps.install("com.spotify.music");
await phone.apps.open("com.spotify.music/.MainActivity");
await phone.apps.close("com.spotify.music");
const packageList = await phone.apps.listInstalled();

// Visual Feedback
const screenshot = await phone.screenshot();
const recId = await phone.record.start();
await phone.record.stop(recId);

// Push a local file to the device
await phone.files.push("local.txt", "/sdcard/Documents/local.txt");

// Pull a file from the device
await phone.files.pull("/sdcard/Pictures/image.png", "downloaded_image.png");
```

### Other Interaction Methods

```javascript
// Shell Commands
// Get the list of packages
const packages = await phone.shell("pm list packages");

// Start an activity
await phone.shell("am start -n com.android.settings/.Settings\$WifiSettingsActivity");

// Wait Utilities
// Wait for a different app
await phone.waitForApp("com.instagram.android", 15000);

// Sleep for a longer duration
await phone.wait(3000);
```

## Use Cases

### E-commerce Assistant:
- Analyzes products from various shopping apps.
- Compares prices, features, and reviews with improved contextual awareness.
- Facilitates purchase decisions based on user preferences.
- Monitors price trends and advises on the best time to buy.

### Social Media Management:
- Evaluates content quality and potential engagement prior to publishing.
- Tracks competitor actions with contextual insights.
- Suggests content based on audience data.
- Implements cross-platform posting strategies.

### Travel Planning:
- Searches across multiple travel sites while considering user preferences.
- Compares intricate travel choices using various factors.
- Handles end-to-end booking with inter-app functionality.
- Observes price fluctuations and recommends optimal booking times.

### Personal Assistant:
- Schedules appointments with smart calendar management.
- Manages finances by understanding spending habits.
- Organizes tasks with contextual awareness of priorities.
- Performs complex, adaptive workflows.

## Security and Privacy

- Isolated Environments: Each virtual device runs in an isolated container
- Best Practices:
  - Store API keys in environment variables
  - Rotate API keys periodically
  - Use scoped permissions when possible
  - Close sandbox instances when done to free resources

## AirTap Technical Foundation

AirTap is built on top of:
- Android 13 (API level 33) running inside a KVM guest with hardware acceleration
- WebRTC for low-latency video streaming
- ADB for device control and file management
- LLM vision models for UI understanding and decision making
- Custom reasoning chains for domain-specific tasks

## ❓ Troubleshooting

### Common Issues

#### Connection Problems
Error: Could not connect to Android device
- Check that your API key is correctly set
- Ensure you have a stable internet connection
- Verify firewall settings are not blocking WebRTC connections

#### Performance Issues
- For slow responses, try reducing screen resolution:
  ```javascript
  const phone = await AndroidSandbox.create({ resolution: [720, 1280], dpi: 240 });
  ```
- For memory-intensive apps, increase VM memory:
  ```javascript
  const phone = await AndroidSandbox.create({ memory_mb: 4096 });
  ```

## 🔮 Next Steps

- Combine the Android sandbox capabilities to your domain to build fully autonomous mobile agents
- Browse example projects in the examples/ folder
- Join our community on Discord
- Sign up for production access at airtap.ai

## 📚 API Reference

For complete API documentation, see the API Reference.
- Python - https://github.com/ivjot-bst/airtap_android
- JavaScript - https://github.com/ivjot-bst/airtapAndroid
