import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    PlayArrow as PlayArrowIcon,
    Refresh as RefreshIcon,
    Stop as StopIcon,
    Sync as SyncIcon,
    Visibility as VisibilityIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface SyncOperation {
  id: string;
  type: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'partial';
  progress: number;
  startTime: string;
  endTime?: string;
  recordsProcessed: number;
  totalRecords: number;
  errorCount: number;
  deviceId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  facility?: string;
  duration?: number;
  syncType?: string;
  operation?: string;
  dataTypes?: string[];
  errors?: any[];
}

export default function SyncManagement() {
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<SyncOperation | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState({
    total: 0,
    completed: 0,
    running: 0,
    failed: 0,
  });

  // Fetch sync operations from backend
  const fetchSyncOperations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSyncManagement({ limit: 20, page: 1 });
      if (response.success) {
        setSyncOperations(response.data.operations);
        setSyncStats(response.data.stats);
      } else {
        setError('Failed to fetch sync operations');
      }
    } catch (err) {
      console.error('Error fetching sync operations:', err);
      setError('Failed to fetch sync operations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchSyncOperations();
  }, [fetchSyncOperations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'failed':
        return 'error';
      case 'initiated':
        return 'warning';
      case 'cancelled':
        return 'default';
      case 'partial':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <SyncIcon className="animate-spin" />;
      case 'failed':
        return <ErrorIcon />;
      case 'initiated':
        return <WarningIcon />;
      case 'cancelled':
        return <StopIcon />;
      case 'partial':
        return <WarningIcon />;
      default:
        return <SyncIcon />;
    }
  };

  const handleViewDetails = (operation: SyncOperation) => {
    setSelectedOperation(operation);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOperation(null);
  };

  // Stats now come from backend in setSyncStats; remove local recompute

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
              Sync Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor and manage data synchronization operations
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchSyncOperations}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              disabled
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Start Sync (coming soon)
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Operations', value: syncStats.total, color: '#3b82f6', icon: <SyncIcon /> },
          { label: 'Completed', value: syncStats.completed, color: '#10b981', icon: <CheckCircleIcon /> },
          { label: 'Running', value: syncStats.running, color: '#f59e0b', icon: <SyncIcon /> },
          { label: 'Failed', value: syncStats.failed, color: '#ef4444', icon: <ErrorIcon /> },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Sync Operations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Sync Operations
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Operation ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Records</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {syncOperations.map((operation) => (
                    <TableRow key={operation.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {operation.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={operation.type.replace('_', ' ').toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(operation.status)}
                          label={operation.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(operation.status) as any}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                          <LinearProgress
                            variant="determinate"
                            value={operation.progress}
                            sx={{ flex: 1, mr: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">
                            {operation.progress}%
              </Typography>
            </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {operation.recordsProcessed.toLocaleString()} / {operation.totalRecords.toLocaleString()}
                        </Typography>
                        {operation.errorCount > 0 && (
                          <Typography variant="caption" color="error">
                            {operation.errorCount} errors
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(operation.startTime).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(operation)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {operation.status === 'in_progress' && (
                          <IconButton size="small" color="error">
                            <StopIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Operation Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Sync Operation Details
        </DialogTitle>
        <DialogContent>
          {selectedOperation && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Operation ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 2 }}>
                    {selectedOperation.id}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedOperation.type.replace('_', ' ').toUpperCase()}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedOperation.status)}
                    label={selectedOperation.status.toUpperCase()}
                    color={getStatusColor(selectedOperation.status) as any}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedOperation.progress}
                      sx={{ flex: 1, mr: 2, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body1">
                      {selectedOperation.progress}%
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Records Processed
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedOperation.recordsProcessed.toLocaleString()} / {selectedOperation.totalRecords.toLocaleString()}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Error Count
                  </Typography>
                  <Typography variant="body1" color={selectedOperation.errorCount > 0 ? 'error' : 'text.primary'}>
                    {selectedOperation.errorCount}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Timeline
                  </Typography>
                  <Typography variant="body2">
                    Started: {new Date(selectedOperation.startTime).toLocaleString()}
                  </Typography>
                  {selectedOperation.endTime && (
                    <Typography variant="body2">
                      Ended: {new Date(selectedOperation.endTime).toLocaleString()}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
