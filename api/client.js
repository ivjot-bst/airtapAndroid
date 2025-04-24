/**
 * API Client for AirTap Android SDK
 * Handles communication with the AirTap service
 */

const axios = require('axios');
const { ApiError } = require('../exceptions');

class ApiClient {
  /**
   * Create a new API client
   * @param {string} apiKey - AirTap API key
   * @param {string} baseUrl - Base URL for the API
   */
  constructor(apiKey, baseUrl = 'https://api.airtap.dev/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw new ApiError(`GET request failed: ${error.message}`, error);
    }
  }

  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw new ApiError(`POST request failed: ${error.message}`, error);
    }
  }

  /**
   * Make a PUT request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw new ApiError(`PUT request failed: ${error.message}`, error);
    }
  }

  /**
   * Make a DELETE request to the API
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      throw new ApiError(`DELETE request failed: ${error.message}`, error);
    }
  }
}

module.exports = ApiClient;
