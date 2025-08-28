import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { apiService } from '../../services/api';

interface PatientAnalytics {
  period: {
    startDate: string;
    endDate: string;
  };
  medicalActivities: Array<{
    activityType: string;
    count: number;
    uniquePatients: number;
  }>;
  neonatalCareStats: Array<{
    _id: string;
    total: number;
    severityBreakdown: Array<{
      severity: string;
      count: number;
    }>;
  }>;
  diagnosisTrends: Array<{
    _id: string;
    started: number;
    completed: number;
  }>;
  ageGroupDistribution: Array<{
    ageGroup: string;
    count: number;
    uniquePatients: number;
  }>;
  clinicalSupportUsage: Array<{
    _id: string;
    count: number;
    avgConfidence: number;
  }>;
  summary: {
    totalMedicalActivities: number;
    totalNeonatalCases: number;
    totalDiagnoses: number;
    completionRate: string;
  };
}

interface MedicalChartsPanelProps {
  dateRange?: [Date | null, Date | null];
  userId?: string;
}

const MedicalChartsPanel: React.FC<MedicalChartsPanelProps> = ({ dateRange, userId }) => {
  const [analytics, setAnalytics] = useState<PatientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchPatientAnalytics();
  }, [dateRange, groupBy]);

  const fetchPatientAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPatientAnalytics({
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
        groupBy,
        includeCharts: true,
        userId
      });

      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching patient analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeColor = (activityType: string) => {
    const colors: { [key: string]: string } = {
      'neonatal_care_start': '#ff6b6b',
      'neonatal_assessment': '#ff8e8e',
      'clinical_decision_support': '#4ecdc4',
      'diagnosis_start': '#45b7d1',
      'diagnosis_complete': '#96ceb4',
      'patient_assessment': '#feca57',
      'clinical_record_access': '#ff9ff3'
    };
    return colors[activityType] || '#95a5a6';
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'routine': '#2ecc71',
      'moderate': '#f39c12',
      'severe': '#e74c3c',
      'critical': '#8e44ad',
      'emergency': '#c0392b'
    };
    return colors[severity] || '#95a5a6';
  };

  const formatActivityType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading medical analytics...</Typography>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No medical data available</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Group By</InputLabel>
          <Select
            value={groupBy}
            label="Group By"
            onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
          >
            <MenuItem value="day">Daily</MenuItem>
            <MenuItem value="week">Weekly</MenuItem>
            <MenuItem value="month">Monthly</MenuItem>
          </Select>
        </FormControl>
        
        <Typography variant="body2" color="text.secondary">
          Medical Activity Analytics • {analytics.summary.totalMedicalActivities} total activities
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Medical Activities Overview */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Medical Activities Distribution
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.medicalActivities}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="activityType" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      fontSize={12}
                      tickFormatter={formatActivityType}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'count' ? 'Activities' : 'Unique Patients']}
                      labelFormatter={(label) => formatActivityType(label)}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#3b82f6" 
                      name="Activities"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="uniquePatients" 
                      fill="#10b981" 
                      name="Unique Patients"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Age Group Distribution */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Age Group Distribution
                </Typography>
                
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.ageGroupDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="ageGroup"
                    >
                      {analytics.ageGroupDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getActivityTypeColor(entry.ageGroup)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, 'Activities']}
                      labelFormatter={(label) => formatActivityType(label)}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <Box sx={{ mt: 2 }}>
                  {analytics.ageGroupDistribution.map((item, index) => (
                    <Box key={item.ageGroup} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getActivityTypeColor(item.ageGroup),
                          mr: 1
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {formatActivityType(item.ageGroup)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MedicalChartsPanel;
