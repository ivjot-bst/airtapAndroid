/**
 * Unit tests for the AndroidSandbox class
 */

const { AndroidSandbox } = require('../index');
const { expect } = require('jest');

// Mock the API client
jest.mock('../api/client', () => {
  return class MockApiClient {
    constructor() {
      this.get = jest.fn().mockResolvedValue({});
      this.post = jest.fn().mockResolvedValue({ deviceId: 'test-device-id' });
      this.put = jest.fn().mockResolvedValue({});
      this.delete = jest.fn().mockResolvedValue({});
    }
  };
});

describe('AndroidSandbox', () => {
  let sandbox;
  
  beforeEach(async () => {
    // Create a new sandbox for each test
    sandbox = await AndroidSandbox.create({
      resolution: [1080, 1920],
      dpi: 320,
      webrtc: false
    });
  });
  
  afterEach(async () => {
    // Clean up after each test
    if (sandbox) {
      await sandbox.close();
    }
  });
  
  test('should create a sandbox with valid device ID', () => {
    expect(sandbox).toBeDefined();
    expect(sandbox.deviceId).toBe('test-device-id');
  });
  
  test('should execute shell commands', async () => {
    // Mock the executeShellCommand response
    sandbox.apiClient.post.mockResolvedValueOnce({
      output: 'command output'
    });
    
    const output = await sandbox.executeShellCommand('ls -la');
    expect(output).toBe('command output');
    expect(sandbox.apiClient.post).toHaveBeenCalledWith('/shell', {
      deviceId: 'test-device-id',
      command: 'ls -la'
    });
  });
  
  test('should tap on the screen', async () => {
    // Mock the tap response
    sandbox.apiClient.post.mockResolvedValueOnce({});
    
    await sandbox.tap([500, 500]);
    expect(sandbox.apiClient.post).toHaveBeenCalledWith('/input/tap', {
      deviceId: 'test-device-id',
      x: 500,
      y: 500
    });
  });
  
  test('should swipe on the screen', async () => {
    // Mock the swipe response
    sandbox.apiClient.post.mockResolvedValueOnce({});
    
    await sandbox.swipe([100, 100], [500, 500], 300);
    expect(sandbox.apiClient.post).toHaveBeenCalledWith('/input/swipe', {
      deviceId: 'test-device-id',
      startX: 100,
      startY: 100,
      endX: 500,
      endY: 500,
      duration: 300
    });
  });
  
  test('should input text', async () => {
    // Mock the inputText response
    sandbox.apiClient.post.mockResolvedValueOnce({});
    
    await sandbox.inputText('Hello, world!');
    expect(sandbox.apiClient.post).toHaveBeenCalledWith('/input/text', {
      deviceId: 'test-device-id',
      text: 'Hello, world!'
    });
  });
  
  test('should press a key', async () => {
    // Mock the pressKey response
    sandbox.apiClient.post.mockResolvedValueOnce({});
    
    await sandbox.pressKey('KEYCODE_HOME');
    expect(sandbox.apiClient.post).toHaveBeenCalledWith('/input/key', {
      deviceId: 'test-device-id',
      key: 'KEYCODE_HOME'
    });
  });
  
  test('should take a screenshot', async () => {
    // Mock the screenshot response
    sandbox.apiClient.get.mockResolvedValueOnce({
      screenshot: 'base64-encoded-image',
      path: '/sdcard/screenshot.png'
    });
    
    const path = await sandbox.screenshot();
    expect(path).toBe('/sdcard/screenshot.png');
    expect(sandbox.apiClient.get).toHaveBeenCalledWith('/screenshot', {
      deviceId: 'test-device-id'
    });
  });
  
  test('should close the sandbox', async () => {
    // Mock the close response
    sandbox.apiClient.delete.mockResolvedValueOnce({});
    
    await sandbox.close();
    expect(sandbox.apiClient.delete).toHaveBeenCalledWith(`/devices/${sandbox.deviceId}`);
  });
});
