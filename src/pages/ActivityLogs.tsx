import {
    Download as DownloadIcon,
    Psychology as PsychologyIcon,
    Search as SearchIcon,
    Timeline as TimelineIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityLog, DecisionSupportLog, DecisionSupportSummary, apiService } from '../services/api';

interface EnhancedActivityLog extends ActivityLog {
  patient?: {
    patientId: string;
    age: number;
    gender: string;
    symptoms: string[];
    vitalSigns?: any;
    medicalHistory?: string[];
  };
  decisionSupport?: {
    rulesTriggered: string[];
    recommendations: string[];
    alerts: string[];
    confidence: number;
    pathTaken: string;
    timeSpent: number;
    clinicianOverride?: boolean;
  };
  diagnoses: Array<{
    id: string;
    timestamp: string;
    patientId: string;
    symptoms: string[];
    diagnosis: string;
    confidence: number;
    severity: string;
    recommendations: string[];
    followUpRequired: boolean;
    clinicianNotes?: string;
    decisionSupportUsed: boolean;
    rulesApplied: string[];
    differentialDiagnoses: string[];
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`activity-tabpanel-${index}`}
      aria-labelledby={`activity-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ActivityLogs() {
  const [tabValue, setTabValue] = useState(0);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [decisionSupportLogs, setDecisionSupportLogs] = useState<DecisionSupportLog[]>([]);
  const [decisionSupportSummary, setDecisionSupportSummary] = useState<DecisionSupportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | DecisionSupportLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterMedicalCategory, setFilterMedicalCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getActivityLogs({
        page: pagination.page + 1,
        limit: pagination.limit,
        activityType: filterType === 'all' ? undefined : filterType,
        severity: filterSeverity === 'all' ? undefined : filterSeverity,
        startDate: filterDateRange[0]?.toISOString(),
        endDate: filterDateRange[1]?.toISOString(),
        search: searchTerm || undefined
      });

      if (response.success) {
        setLogs(response.data.activities || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setError('Failed to fetch activity logs');
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filterType, filterSeverity, filterMedicalCategory, filterDateRange, searchTerm]);

  // Fetch decision support logs
  const fetchDecisionSupportLogs = useCallback(async () => {
    try {
      const response = await apiService.getDecisionSupportLogs({
        page: 1,
        limit: 5,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        endDate: new Date().toISOString()
      });

      if (response.success) {
        setDecisionSupportLogs(response.data.activities || []);
        setDecisionSupportSummary(response.data.summary || null);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setError('Failed to fetch decision support logs');
      }
    } catch (err) {
      console.error('Error fetching decision support logs:', err);
      setError('Failed to fetch decision support logs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchActivityLogs();
    fetchDecisionSupportLogs();
  }, [fetchActivityLogs, fetchDecisionSupportLogs]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getActivityIcon = (activityType: string) => {
    if (activityType.includes('diagnosis') || activityType.includes('clinical')) {
      return <PsychologyIcon />;
    }
    const firstLetter = activityType.charAt(0).toUpperCase();
    return firstLetter;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1); // Reset to first page when switching tabs
  };

  const handleViewDetails = (log: ActivityLog | DecisionSupportLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || log.activityType === filterType;
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesMedicalCategory = filterMedicalCategory === 'all' || getMedicalCategory(log) === filterMedicalCategory;

    return matchesSearch && matchesType && matchesSeverity && matchesMedicalCategory;
  });

  const activityTypes = Array.from(new Set(logs.map(log => log.activityType)));

  // Define medical activity categories
  const medicalCategories = [
    'all',
    'neonatal_care',
    'clinical_decision_support',
    'patient_assessment',
    'diagnosis',
    'emergency_care',
    'routine_care'
  ];

  // Helper function to get medical category from activity
  const getMedicalCategory = (log: any) => {
    if (log.activityType?.includes('neonatal')) return 'neonatal_care';
    if (log.activityType?.includes('clinical_decision')) return 'clinical_decision_support';
    if (log.activityType?.includes('patient_assessment')) return 'patient_assessment';
    if (log.activityType?.includes('diagnosis')) return 'diagnosis';
    if (log.medicalContext?.severity === 'emergency' || log.medicalContext?.severity === 'critical') return 'emergency_care';
    if (log.medicalContext?.severity === 'routine') return 'routine_care';
    return 'other';
  };

  // Helper function to format activity type for display
  const formatActivityType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

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
              Activity Logs
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor user activities and clinical decision support usage
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Export Logs">
              <IconButton>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="activity logs tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<TimelineIcon />}
            label="All Activities"
            id="activity-tab-0"
            aria-controls="activity-tabpanel-0"
          />
          <Tab
            icon={<PsychologyIcon />}
            label="Decision Support"
            id="activity-tab-1"
            aria-controls="activity-tabpanel-1"
          />
        </Tabs>
      </Card>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* All Activities Tab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Activity Type</InputLabel>
                  <Select
                    value={filterType}
                    label="Activity Type"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {activityTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {formatActivityType(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Medical Category</InputLabel>
                  <Select
                    value={filterMedicalCategory}
                    label="Medical Category"
                    onChange={(e) => setFilterMedicalCategory(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="neonatal_care">Neonatal Care</MenuItem>
                    <MenuItem value="clinical_decision_support">Clinical Decision Support</MenuItem>
                    <MenuItem value="patient_assessment">Patient Assessment</MenuItem>
                    <MenuItem value="diagnosis">Diagnosis</MenuItem>
                    <MenuItem value="emergency_care">Emergency Care</MenuItem>
                    <MenuItem value="routine_care">Routine Care</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={filterSeverity}
                    label="Severity"
                    onChange={(e) => setFilterSeverity(e.target.value)}
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Logs Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Activities ({filteredLogs.length} records)
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Activity</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                mr: 2,
                                fontSize: '0.875rem',
                              }}
                            >
                              {log.userName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {log.userName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.userRole} - {log.userFacility}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: 'secondary.light',
                                color: 'secondary.dark',
                                mr: 1,
                                fontSize: '0.75rem',
                              }}
                            >
                              {getActivityIcon(log.activityType)}
                            </Avatar>
                            <Typography variant="body2">
                              {log.activityType.replace('_', ' ').toUpperCase()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.action.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {log.details}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.location || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.ipAddress}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.severity.toUpperCase()}
                            size="small"
                            color={getSeverityColor(log.severity) as any}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(log)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Decision Support Tab */}
      <TabPanel value={tabValue} index={1}>
        {/* Summary Statistics */}
        {decisionSupportSummary && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {decisionSupportSummary.totalActivities}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Activities
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {decisionSupportSummary.uniqueUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {decisionSupportSummary.avgDuration}s
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Duration
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {decisionSupportSummary.successRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Decision Support Logs Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Clinical Decision Support Activities ({decisionSupportLogs.length} records)
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Activity</TableCell>
                      <TableCell>Clinical Context</TableCell>
                      <TableCell>Patient Info</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {decisionSupportLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                mr: 2,
                                fontSize: '0.875rem',
                              }}
                            >
                              {log.user.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {log.user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.user.role} - {log.user.facility}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {log.action.replace('_', ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {log.screen}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {log.clinicalContext.category && (
                              <Chip
                                label={log.clinicalContext.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 0.5 }}
                              />
                            )}
                            {log.clinicalContext.severity && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Severity: {log.clinicalContext.severity}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {log.patientInfo?.ageGroup && (
                              <Typography variant="caption" display="block">
                                Age: {log.patientInfo.ageGroup}
                              </Typography>
                            )}
                            {log.patientInfo?.chiefComplaint && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  maxWidth: 150,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block'
                                }}
                              >
                                {log.patientInfo.chiefComplaint}
                              </Typography>
                            )}
                            {log.patientInfo?.symptoms && log.patientInfo.symptoms.length > 0 && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {log.patientInfo.symptoms.length} symptoms
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {Math.round(log.duration / 1000)}s
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.location.facility || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.location.facilityType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.successful ? 'Success' : 'Failed'}
                            size="small"
                            color={log.successful ? 'success' : 'error'}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(log)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Activity Details
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Basic Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Activity:</strong> {selectedLog.activityType}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Action:</strong> {selectedLog.action}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    User Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>User:</strong> {'user' in selectedLog ? selectedLog.user.name : selectedLog.userName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Role:</strong> {'user' in selectedLog ? selectedLog.user.role : selectedLog.userRole}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Facility:</strong> {'user' in selectedLog ? selectedLog.user.facility : selectedLog.userFacility}
                  </Typography>
                </Grid>
                {'clinicalContext' in selectedLog && selectedLog.clinicalContext && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Clinical Context
                    </Typography>
                    <Typography variant="body2">
                      <strong>Category:</strong> {selectedLog.clinicalContext.category || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Severity:</strong> {selectedLog.clinicalContext.severity || 'N/A'}
                    </Typography>
                    {selectedLog.clinicalContext.diagnosisId && (
                      <Typography variant="body2">
                        <strong>Diagnosis ID:</strong> {selectedLog.clinicalContext.diagnosisId}
                      </Typography>
                    )}
                  </Grid>
                )}
                {'patientInfo' in selectedLog && selectedLog.patientInfo && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Patient Information
                    </Typography>
                    {selectedLog.patientInfo.ageGroup && (
                      <Typography variant="body2">
                        <strong>Age Group:</strong> {selectedLog.patientInfo.ageGroup}
                      </Typography>
                    )}
                    {selectedLog.patientInfo.chiefComplaint && (
                      <Typography variant="body2">
                        <strong>Chief Complaint:</strong> {selectedLog.patientInfo.chiefComplaint}
                      </Typography>
                    )}
                    {selectedLog.patientInfo.symptoms && selectedLog.patientInfo.symptoms.length > 0 && (
                      <Typography variant="body2">
                        <strong>Symptoms:</strong> {selectedLog.patientInfo.symptoms.join(', ')}
                      </Typography>
                    )}
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Details
                  </Typography>
                  <Typography variant="body2">
                    {selectedLog.details}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
