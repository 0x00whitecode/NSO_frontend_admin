import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      permissions: string[];
    };
  };
  error?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin' | 'analyst';
  avatar?: string;
  permissions: string[];
}

class AuthService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  constructor() {
    // Add request interceptor to include auth token
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // For demo purposes, simulate admin login
      if (email === 'admin@nso.gov.ng' && password === 'admin123') {
        const mockResponse: LoginResponse = {
          success: true,
          data: {
            token: 'mock-admin-token-' + Date.now(),
            user: {
              id: 'admin-1',
              name: 'NSO Administrator',
              email: 'admin@nso.gov.ng',
              role: 'super_admin',
              permissions: [
                'users.read',
                'users.write',
                'analytics.read',
                'sync.manage',
                'activity.read',
                'settings.write',
              ],
            },
          },
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockResponse;
      }

      // For other demo accounts
      if (email === 'analyst@nso.gov.ng' && password === 'analyst123') {
        const mockResponse: LoginResponse = {
          success: true,
          data: {
            token: 'mock-analyst-token-' + Date.now(),
            user: {
              id: 'analyst-1',
              name: 'Data Analyst',
              email: 'analyst@nso.gov.ng',
              role: 'analyst',
              permissions: [
                'analytics.read',
                'activity.read',
                'users.read',
              ],
            },
          },
        };
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockResponse;
      }

      // In production, make actual API call
      const response = await this.apiClient.post('/admin/login', {
        email,
        password,
      });

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Invalid credentials or server error',
      };
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      // For demo purposes, validate mock tokens
      if (token.startsWith('mock-admin-token')) {
        return {
          id: 'admin-1',
          name: 'NSO Administrator',
          email: 'admin@nso.gov.ng',
          role: 'super_admin',
          permissions: [
            'users.read',
            'users.write',
            'analytics.read',
            'sync.manage',
            'activity.read',
            'settings.write',
          ],
        };
      }

      if (token.startsWith('mock-analyst-token')) {
        return {
          id: 'analyst-1',
          name: 'Data Analyst',
          email: 'analyst@nso.gov.ng',
          role: 'analyst',
          permissions: [
            'analytics.read',
            'activity.read',
            'users.read',
          ],
        };
      }

      // In production, make actual API call
      const response = await this.apiClient.get('/admin/verify');
      return response.data.user;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      // In production, make API call to invalidate token
      await this.apiClient.post('/admin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await this.apiClient.post('/admin/refresh');
      return response.data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await this.apiClient.post('/admin/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data.success;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<boolean> {
    try {
      const response = await this.apiClient.put('/admin/profile', profileData);
      return response.data.success;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
