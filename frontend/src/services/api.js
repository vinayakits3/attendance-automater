// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  /**
   * Process INN attendance from fixed file
   */
  static async processINNAttendance() {
    const response = await fetch(`${API_BASE_URL}/api/attendance/process-inn`);
    return this._handleResponse(response);
  }

  /**
   * Process attendance from fixed file (June 2025)
   */
  static async processFixedFile() {
    const response = await fetch(`${API_BASE_URL}/api/attendance/process-fixed-file`);
    return this._handleResponse(response);
  }

  /**
   * Get INN department summary
   */
  static async getINNSummary() {
    const response = await fetch(`${API_BASE_URL}/api/inn-summary`);
    return this._handleResponse(response);
  }

  /**
   * Upload and process Excel file
   */
  static async uploadFile(file) {
    const formData = new FormData();
    formData.append('excelFile', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    return this._handleResponse(response);
  }

  /**
   * Get system configuration
   */
  static async getConfig() {
    const response = await fetch(`${API_BASE_URL}/api/config`);
    return this._handleResponse(response);
  }

  /**
   * Get system health status
   */
  static async getHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return this._handleResponse(response);
  }

  /**
   * Handle API response
   * @private
   */
  static async _handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
}

export default ApiService;
