import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nso-backend-heavy.onrender.com';
const API_VERSION = '/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken: string | null = localStorage.getItem('admin_token');

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // For admin routes, add admin access header
    if (config.url?.includes('/admin/')) {
      config.headers['x-admin-access'] = 'true';
      config.headers['x-admin-token'] = authToken || 'admin-access-token';
    }

    // Add auth token for other routes
    if (authToken && !config.url?.includes('/admin/')) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - clearing token');
      clearAuthToken();
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('admin_token', token);
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('admin_token');
};

export const getAuthToken = () => {
  return authToken;
};

// Types
export interface User {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  facility: string;
  state: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  deviceId: string;
  registeredAt: string;
  isActive: boolean;
  contactInfo?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deviceInfo: {
    deviceId: string;
    activationKeyId: string;
    isActivated: boolean;
    activatedAt?: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
  };
  activationKeyInfo?: {
    keyId: string;
    shortCode: string;
    status: string;
    expiresAt: string;
    remainingDays: number;
    createdBy: {
      adminId: string;
      adminName: string;
      adminEmail: string;
    };
  };
}

export interface ActivationKey {
  keyId: string;
  activationKey: string;
  shortCode: string;
  userId: string;
  deviceId: string;
  role: string;
  facility: string;
  state: string;
  validityMonths: number;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired' | 'revoked';
  isUsed: boolean;
  usedAt?: string;
  createdBy: {
    adminId: string;
    adminName: string;
    adminEmail: string;
  };
  notes?: string;
  adminNotes?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  role: string;
  facility: string;
  state: string;
  contactInfo: string;
  deviceId: string;
  validityMonths: number;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface UserProfileSubmission {
  fullName: string;
  role: string;
  facility: string;
  state: string;
  contactInfo: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deviceId: string;
  deviceInfo: any;
  currentLocation: any;
  sessionId: string;
  timestamp: string;
}

export interface DashboardStats {
  users: {
    total: number;
    new: number;
    active: number;
    roleBreakdown: Record<string, number>;
  };
  activationKeys: {
    total: number;
    active: number;
    used: number;
    expired: number;
    revoked: number;
  };
  activities: {
    total: number;
    errors: number;
    errorRate: number;
  };
  diagnoses: {
    total: number;
    completed: number;
    completionRate: number;
  };
  sync: {
    total: number;
    failed: number;
    successRate: number;
  };
  recent: {
    users: {
      userId: string;
      fullName: string;
      role: string;
      facility: string;
      createdAt: string;
    }[];
    keys: {
      keyId: string;
      shortCode: string;
      status: string;
      facility: string;
      createdAt: string;
      createdBy: {
        adminName: string;
      };
    }[];
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userFacility: string;
  activityType: string;
  action: string;
  details: string;
  location: string;
  ipAddress: string;
  deviceInfo: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  clinicalContext?: {
    recordId?: string;
    diagnosisId?: string;
    category?: string;
    severity?: string;
  };
  performance?: {
    duration?: number;
    loadTime?: number;
    memoryUsage?: number;
  };
  error?: {
    code: string;
    message: string;
    severity: string;
  };
  sessionId: string;
}

export interface DecisionSupportLog {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    facility: string;
    state: string;
  };
  activityType: string;
  action: string;
  screen: string;
  details: string;
  clinicalContext: {
    recordId?: string;
    diagnosisId?: string;
    category?: string;
    severity?: string;
    diagnosisType?: string;
  };
  patientInfo?: {
    age?: string;
    ageGroup?: string;
    symptoms?: string[];
    chiefComplaint?: string;
    vitalSigns?: any;
  };
  recommendations?: any[];
  performance: {
    duration?: number;
    loadTime?: number;
    memoryUsage?: number;
  };
  location: {
    address: string;
    facility: string;
    facilityType: string;
    coordinates: string;
  };
  deviceInfo: {
    deviceId: string;
    sessionId: string;
  };
  duration: number;
  successful: boolean;
  error?: {
    code: string;
    message: string;
    severity: string;
  };
}

export interface DecisionSupportSummary {
  totalActivities: number;
  uniqueUsers: number;
  avgDuration: number;
  successRate: string;
  clinicalCategories: string[];
  diagnosisTypes: string[];
}

// API Service Class
class ApiService {
  // Health check
  async healthCheck() {
    const response = await apiClient.get('/health');
    return response.data;
  }

  // Authentication API
  async adminLogin(credentials: { email: string; password: string }) {
    // Simple admin login - in production, this would validate against admin credentials
    // For now, we'll mock a successful login for admin users
    if (credentials.email.includes('admin') || credentials.email.includes('nso')) {
      const mockToken = 'mock-admin-token-' + Date.now();
      setAuthToken(mockToken);

      return {
        success: true,
        data: {
          user: {
            id: 'admin-1',
            email: credentials.email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            facility: 'NSO Headquarters',
            isActive: true
          },
          token: mockToken,
          expiresIn: '24h'
        }
      };
    } else {
      return {
        success: false,
        error: 'Invalid admin credentials',
        code: 'INVALID_CREDENTIALS'
      };
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthToken();
    }
  }

  async verifyToken() {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  }

  // Users API
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    facility?: string;
    state?: string;
  } = {}) {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  }

  async getUser(userId: string) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest) {
    try {
      console.log('API createUser called with data:', userData);
      console.log('Making POST request to /admin/users');
      const response = await apiClient.post('/admin/users', userData);
      console.log('API response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API createUser error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create user'
      };
    }
  }

  async updateUser(userId: string, userData: Partial<User>) {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async updateUserStatus(userId: string, isActive: boolean, reason?: string) {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { isActive, reason });
    return response.data;
  }

  async submitUserProfile(profileData: UserProfileSubmission) {
    try {
      console.log('API submitUserProfile called with data:', profileData);
      const response = await apiClient.post('/admin/users/profile', profileData);
      console.log('API response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API submitUserProfile error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit user profile'
      };
    }
  }

  async deleteUser(userId: string) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete user'
      };
    }
  }

  async getUserDetails(userId: string) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  }

  // Activation Keys API
  async getActivationKeys(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/activation-keys', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching activation keys:', error);
      return {
        success: false,
        error: 'Failed to fetch activation keys',
        data: { activationKeys: [], pagination: { total: 0 } }
      };
    }
  }

  async createActivationKey(keyData: {
    userDetails: {
      fullName: string;
      email: string;
      phone?: string;
      role: string;
      facility?: string;
      state?: string;
    };
    expiresAt: string;
    notes?: string;
  }) {
    try {
      console.log('Creating 12-digit activation key with data:', keyData);
      const response = await apiClient.post('/admin/activation-keys', keyData);
      console.log('Activation key creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Activation key creation error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create activation key'
      };
    }
  }

  async revokeActivationKey(keyId: string, reason?: string) {
    try {
      const response = await apiClient.post(`/admin/activation-keys/${keyId}/revoke`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('Error revoking activation key:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to revoke activation key'
      };
    }
  }

  // Sync Management API
  async getSyncManagement(params: {
    page?: number;
    limit?: number;
    status?: string;
    syncType?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    deviceId?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/sync-management', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sync management data:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sync management data',
        data: { operations: [], stats: { total: 0, completed: 0, running: 0, failed: 0 }, pagination: { total: 0 } }
      };
    }
  }

  // Activity Logs API
  async getActivityLogs(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    facility?: string;
    activityType?: string;
    patientId?: string;
    diagnosisType?: string;
    includeDetails?: boolean;
    // added to support UI filters
    severity?: string;
    search?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/activity-logs', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch activity logs',
        data: { activities: [], statistics: {}, pagination: { total: 0 } }
      };
    }
  }

  // Patient Analytics API
  async getPatientAnalytics(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
    includeCharts?: boolean;
    userId?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/patient-analytics', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching patient analytics:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch patient analytics',
        data: {
          medicalActivities: [],
          neonatalCareStats: [],
          diagnosisTrends: [],
          ageGroupDistribution: [],
          clinicalSupportUsage: [],
          summary: {
            totalMedicalActivities: 0,
            totalNeonatalCases: 0,
            totalDiagnoses: 0,
            completionRate: '0'
          }
        }
      };
    }
  }



  // Dashboard API
  async getDashboardStats(): Promise<{ data: DashboardStats }> {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  }

  // Analytics API
  async getErrorAnalytics(params: {
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/analytics/errors', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching error analytics:', error);
      return {
        success: false,
        error: 'Failed to fetch error analytics',
        data: { errorStats: {}, errorTrends: [] }
      };
    }
  }

  async getUsageAnalytics(params: {
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/analytics/usage', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching usage analytics:', error);
      return {
        success: false,
        error: 'Failed to fetch usage analytics',
        data: { dailyActiveUsers: [], featureUsage: [], geographicDistribution: [], deviceDistribution: [] }
      };
    }
  }

  async getGeographicAnalytics(params: {
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/analytics/geographic', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching geographic analytics:', error);
      return {
        success: false,
        error: 'Failed to fetch geographic analytics',
        data: { stateDistribution: [], facilityDistribution: [] }
      };
    }
  }

  async getPerformanceAnalytics(params: {
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const response = await apiClient.get('/admin/analytics/performance', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance analytics:', error);
      return {
        success: false,
        error: 'Failed to fetch performance analytics',
        data: { performanceMetrics: [], syncPerformance: [] }
      };
    }
  }

  async getSystemHealth() {
    const response = await apiClient.get('/admin/system/health');
    return response.data;
  }



  async getDecisionSupportLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const response = await apiClient.get('/admin/activity-logs/decision-support', { params });
    return response.data;
  }

  // Sync Management API - Note: These would need to be implemented in backend
  async getSyncStatus() {
    // For now, return mock data since this endpoint doesn't exist yet
    return {
      success: true,
      data: {
        status: 'healthy',
        lastSync: new Date().toISOString(),
        pendingCount: 0
      }
    };
  }

  async triggerSync(syncType: string) {
    // For now, return mock data since this endpoint doesn't exist yet
    return {
      success: true,
      data: {
        syncId: 'mock-sync-' + Date.now(),
        status: 'initiated',
        syncType
      }
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
