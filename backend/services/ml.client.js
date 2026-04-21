/**
 * ML Client Service
 * Handles communication with FastAPI ML service for pest image detection
 * Graceful fallback if service is unavailable
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class MLClient {
  constructor() {
    this.mlServiceURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.timeout = 10000; // 10 seconds
    this.isHealthy = false;
  }

  /**
   * Check if ML service is available
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.mlServiceURL}/health`, {
        timeout: 5000,
      });
      this.isHealthy = response.status === 200;
      console.log(`✓ ML Service healthy: ${this.isHealthy}`);
      return this.isHealthy;
    } catch (error) {
      console.warn('ML Service unavailable:', error.message);
      this.isHealthy = false;
      return false;
    }
  }

  /**
   * Predict pest from image
   * Sends image to FastAPI ML endpoint for analysis
   */
  async predictPest(imagePath, crop = null) {
    try {
      // Check if service is available
      if (!this.isHealthy) {
        const healthy = await this.healthCheck();
        if (!healthy) {
          return {
            success: false,
            error: 'ML service unavailable',
            fallbackNeeded: true,
          };
        }
      }

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        return {
          success: false,
          error: 'Image file not found',
        };
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      if (crop) {
        formData.append('crop', crop);
      }

      // Send to ML service
      const response = await axios.post(`${this.mlServiceURL}/predict/pest`, formData, {
        headers: formData.getHeaders(),
        timeout: this.timeout,
      });

      return {
        success: true,
        prediction: response.data.predicted_pest,
        confidence: response.data.confidence,
        details: response.data,
      };
    } catch (error) {
      console.error('Error calling ML service:', error.message);
      return {
        success: false,
        error: error.message,
        fallbackNeeded: true,
      };
    }
  }

  /**
   * Get disease recommendations from ML service
   */
  async getRecommendations(pestName, crop) {
    try {
      if (!this.isHealthy) {
        return {
          success: false,
          error: 'ML service unavailable',
        };
      }

      const response = await axios.get(`${this.mlServiceURL}/recommendations`, {
        params: {
          pest: pestName,
          crop: crop,
        },
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error getting recommendations:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Batch predict from multiple images
   */
  async predictBatch(imagePaths) {
    try {
      if (!this.isHealthy) {
        return {
          success: false,
          error: 'ML service unavailable',
        };
      }

      const results = await Promise.all(
        imagePaths.map(path => this.predictPest(path))
      );

      return {
        success: true,
        predictions: results,
      };
    } catch (error) {
      console.error('Error in batch prediction:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get model info and version
   */
  async getModelInfo() {
    try {
      const response = await axios.get(`${this.mlServiceURL}/model/info`, {
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error getting model info:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new MLClient();
