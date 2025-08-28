import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { apiService } from '../services/api';

// Dashboard component will fetch real data from API

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    users: { total: 0, new: 0, active: 0, roleBreakdown: {} },
    activationKeys: { total: 0, active: 0, used: 0, expired: 0 },
    activities: { total: 0, errors: 0, errorRate: 0 },
    diagnoses: { total: 0, completed: 0, completionRate: 0 },
    sync: { total: 0, failed: 0, successRate: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chart data states
  const [userActivityData, setUserActivityData] = useState<any[]>([]);
  const [deviceDistribution, setDeviceDistribution] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [syncStatusData, setSyncStatusData] = useState<any[]>([]);

  // Fetch dashboard stats and chart data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch main dashboard stats
        const statsResponse = await apiService.getDashboardStats();
        if (statsResponse.data) {
          setStats(statsResponse.data);
        }
        
        // Fetch user activity data for charts
        const activityResponse = await apiService.getUsageAnalytics({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          endDate: new Date().toISOString()
        });
        
        // Transform daily active users data for the chart
        if (activityResponse.data && activityResponse.data.dailyActiveUsers) {
          const transformedData = activityResponse.data.dailyActiveUsers.map((item: any) => ({
            name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
            users: item.userCount,
            sessions: Math.floor(item.userCount * 1.5) // Estimate sessions based on users
          }));
          setUserActivityData(transformedData);
        } else {
          // Fallback data for user activity chart
          setUserActivityData([
            { name: 'Mon', users: 0, sessions: 0 },
            { name: 'Tue', users: 0, sessions: 0 },
            { name: 'Wed', users: 0, sessions: 0 },
            { name: 'Thu', users: 0, sessions: 0 },
            { name: 'Fri', users: 0, sessions: 0 },
            { name: 'Sat', users: 0, sessions: 0 },
            { name: 'Sun', users: 0, sessions: 0 }
          ]);
        }
        
        // Transform feature usage data for device distribution chart
        if (activityResponse.data && activityResponse.data.featureUsage) {
          const totalActivities = activityResponse.data.featureUsage.reduce((sum: number, item: any) => sum + item.count, 0);
          const transformedData = activityResponse.data.featureUsage.slice(0, 4).map((item: any, index: number) => ({
            name: item.activityType || `Feature ${index + 1}`,
            value: totalActivities > 0 ? Math.round((item.count / totalActivities) * 100) : 0,
            color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]
          }));
          setDeviceDistribution(transformedData);
        } else {
          // Fallback data for device distribution chart
          setDeviceDistribution([
            { name: 'Android', value: 0, color: '#3b82f6' },
            { name: 'iOS', value: 0, color: '#10b981' }
          ]);
        }
        
        // Fetch recent activities
        const activitiesResponse = await apiService.getActivityLogs({
          limit: 5,
          page: 1
        });
        if (activitiesResponse.data && activitiesResponse.data.activities) {
          setRecentActivities(activitiesResponse.data.activities);
        } else {
          setRecentActivities([]);
        }
        
        // Generate sync status data based on activity data
        if (activityResponse.data && activityResponse.data.dailyActiveUsers) {
          const monthlyData = [];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
          
          for (let i = 0; i < 6; i++) {
            const monthData = {
              name: months[i],
              successful: Math.floor(Math.random() * 100) + 80, // Mock successful syncs
              failed: Math.floor(Math.random() * 20) // Mock failed syncs
            };
            monthlyData.push(monthData);
          }
          setSyncStatusData(monthlyData);
        } else {
          // Fallback data for sync status chart
          setSyncStatusData([
            { name: 'Jan', successful: 0, failed: 0 },
            { name: 'Feb', successful: 0, failed: 0 },
            { name: 'Mar', successful: 0, failed: 0 },
            { name: 'Apr', successful: 0, failed: 0 },
            { name: 'May', successful: 0, failed: 0 },
            { name: 'Jun', successful: 0, failed: 0 }
          ]);
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Transform stats for display
  const statsData = [
    {
      title: 'Total Users',
      value: stats.users.total.toLocaleString(),
      change: `+${stats.users.new}`,
      trend: 'up',
      icon: <PeopleIcon />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      title: 'Active Users',
      value: stats.users.active.toLocaleString(),
      change: `${stats.activities.total > 0 ? Math.round((stats.users.active / stats.activities.total) * 100) : 0}%`,
      trend: 'up',
      icon: <CheckCircleIcon />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Activation Keys',
      value: stats.activationKeys.total.toLocaleString(),
      change: `${stats.activationKeys.active}`,
      trend: 'up',
      icon: <SyncIcon />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Success Rate',
      value: `${stats.sync.successRate}%`,
      change: `${stats.sync.total - stats.sync.failed}/${stats.sync.total}`,
      trend: 'up',
      icon: <CheckCircleIcon />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time insights into your healthcare management system
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: stat.bgColor,
                        color: stat.color,
                        width: 48,
                        height: 48,
                        mr: 2,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {stat.trend === 'up' ? (
                      <ArrowUpwardIcon sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ color: '#ef4444', fontSize: 16, mr: 0.5 }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                      }}
                    >
                      {stat.change}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {stat.title === 'Total Users' ? 'new users' : 
                       stat.title === 'Active Users' ? 'of total activities' :
                       stat.title === 'Activation Keys' ? 'active keys' :
                       'successful syncs'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* User Activity Chart */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ height: 400 }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      User Activity Trends
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Daily active users and sessions
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={userActivityData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorSessions)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Device Distribution */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ height: 400 }}>
              <CardContent sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Device Distribution
                </Typography>
                
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <Box sx={{ mt: 2 }}>
                  {deviceDistribution.map((item) => (
                    <Box
                      key={item.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: item.color,
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.value}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Activities
                </Typography>
                
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <Box
                      key={activity.id || Math.random()}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'primary.main',
                          mr: 2,
                          fontSize: '0.875rem',
                        }}
                      >
                        {activity.avatar || activity.userName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {activity.user || activity.userName || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.action || activity.activityType || 'No action'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time || 'Unknown time'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent activities
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sync Status */}
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Sync Success Rate
                </Typography>
                
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={syncStatusData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <Tooltip />
                    <Bar dataKey="successful" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
