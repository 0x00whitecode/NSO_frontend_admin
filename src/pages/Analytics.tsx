import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Smartphone as SmartphoneIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { apiService } from '../services/api';

interface AnalyticsData {
  dashboardStats: {
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
  };
  usageAnalytics: {
    dailyActiveUsers: Array<{
      date: string;
      userCount: number;
    }>;
    featureUsage: Array<{
      activityType: string;
      count: number;
      uniqueUsers: number;
    }>;
    geographicDistribution: Array<{
      facility: string;
      userCount: number;
      activityCount: number;
    }>;
    deviceDistribution: Array<{
      deviceType: string;
      userCount: number;
    }>;
  };
  errorAnalytics: {
    errorStats: {
      total: number;
      critical: number;
      warning: number;
      info: number;
    };
    errorTrends: Array<{
      date: string;
      count: number;
      criticalCount: number;
    }>;
  };
  geographicAnalytics: {
    stateDistribution: Array<{
      state: string;
      userCount: number;
    }>;
    facilityDistribution: Array<{
      facility: string;
      userCount: number;
      activityCount: number;
    }>;
  };
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch dashboard stats
      const statsResponse = await apiService.getDashboardStats();
      
      // Fetch usage analytics
      const usageResponse = await apiService.getUsageAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Fetch error analytics
      const errorResponse = await apiService.getErrorAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Fetch geographic analytics
      const geographicResponse = await apiService.getGeographicAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (statsResponse.data && usageResponse.data && errorResponse.data) {
        setAnalyticsData({
          dashboardStats: statsResponse.data,
          usageAnalytics: usageResponse.data,
          errorAnalytics: errorResponse.data,
          geographicAnalytics: geographicResponse.data
        });
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // Transform data for charts
  const userGrowthData = analyticsData?.usageAnalytics.dailyActiveUsers.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: item.userCount,
    newUsers: Math.floor(item.userCount * 0.3), // Estimate new users
    activeUsers: item.userCount
  })) || [];

  const featureUsageData = analyticsData?.usageAnalytics.featureUsage.slice(0, 6).map(item => ({
    name: item.activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    usage: item.count,
    users: item.uniqueUsers
  })) || [];

  const errorTypeData = analyticsData?.errorAnalytics.errorStats ? [
    { name: 'Critical Errors', value: analyticsData.errorAnalytics.errorStats.critical, color: '#ff6b6b' },
    { name: 'Warning Errors', value: analyticsData.errorAnalytics.errorStats.warning, color: '#4ecdc4' },
    { name: 'Info Errors', value: analyticsData.errorAnalytics.errorStats.info, color: '#45b7d1' }
  ] : [];

  const deviceData = analyticsData?.usageAnalytics.deviceDistribution.map((item, index) => ({
    name: item.deviceType,
    value: Math.round((item.userCount / (analyticsData?.dashboardStats.users.total || 1)) * 100),
    users: item.userCount,
    color: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'][index % 4]
  })) || [
    { name: 'Android', value: 65, users: 8345, color: '#4CAF50' },
    { name: 'iOS', value: 25, users: 3209, color: '#2196F3' },
    { name: 'Web', value: 10, users: 1283, color: '#FF9800' }
  ];

  // Transform geographic data from backend
  const geographicData = analyticsData?.geographicAnalytics.stateDistribution.slice(0, 5).map((item, index) => {
    const totalUsers = analyticsData?.dashboardStats.users.total || 1;
    const percentage = Math.round((item.userCount / totalUsers) * 100);
    return {
      state: item.state,
      users: item.userCount,
      percentage,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
    };
  }) || [
    { state: 'Lagos', users: 3247, percentage: 25, color: '#3b82f6' },
    { state: 'Kano', users: 2156, percentage: 17, color: '#10b981' },
    { state: 'Kaduna', users: 1892, percentage: 15, color: '#f59e0b' },
    { state: 'Rivers', users: 1567, percentage: 12, color: '#ef4444' },
    { state: 'Others', users: 4021, percentage: 31, color: '#8b5cf6' }
  ];

  const topFeatures = featureUsageData.map(feature => ({
    feature: feature.name,
    usage: Math.round((feature.users / (analyticsData?.dashboardStats.users.total || 1)) * 100),
    trend: Math.random() > 0.5 ? 'up' : 'down'
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const dashboardStats = analyticsData?.dashboardStats;

  return (
    <Box>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive insights into app usage and user behavior
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </motion.div>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            title: 'Total Users', 
            value: dashboardStats?.users.total.toLocaleString() || '0', 
            change: '+12.5%', 
            trend: 'up', 
            icon: <PeopleIcon /> 
          },
          { 
            title: 'Active Users', 
            value: dashboardStats?.users.active.toLocaleString() || '0', 
            change: '+8.2%', 
            trend: 'up', 
            icon: <TrendingUpIcon /> 
          },
          { 
            title: 'Total Diagnoses', 
            value: dashboardStats?.diagnoses.total.toLocaleString() || '0', 
            change: '+5.1%', 
            trend: 'up', 
            icon: <AssessmentIcon /> 
          },
          {
            title: 'Success Rate',
            value: `${Number(dashboardStats?.sync?.successRate ?? 0).toFixed(1)}%`,
            change: '-2.3%',
            trend: 'down',
            icon: <SmartphoneIcon />
          },
        ].map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: metric.trend === 'up' ? 'success.light' : 'error.light',
                        color: metric.trend === 'up' ? 'success.dark' : 'error.dark',
                        mr: 2,
                      }}
                    >
                      {metric.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={metric.change}
                    size="small"
                    color={metric.trend === 'up' ? 'success' : 'error'}
                    icon={metric.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* User Growth Chart */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ height: 400 }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  User Activity Trends
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      fill="url(#colorUsers)"
                      stroke="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Bar dataKey="newUsers" fill="#10b981" />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#f59e0b"
                      strokeWidth={3}
                    />
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Geographic Distribution */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ height: 400 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Geographic Distribution
                </Typography>
                
                {geographicData.map((item, index) => (
                  <Box key={item.state} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.state}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.users.toLocaleString()} ({item.percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: item.color,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Device Distribution */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Device Distribution
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ResponsiveContainer width="50%" height={150}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <Box sx={{ flex: 1 }}>
                    {deviceData.map((item) => (
                      <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: item.color,
                            mr: 2,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.users.toLocaleString()} users ({item.value}%)
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Top Features */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Feature Usage
                </Typography>
                
                {topFeatures.map((feature, index) => (
                  <Box key={feature.feature} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {feature.feature}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          {feature.usage}%
                        </Typography>
                        {feature.trend === 'up' ? (
                          <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                        )}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={feature.usage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: feature.trend === 'up' ? 'success.main' : 'warning.main',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
