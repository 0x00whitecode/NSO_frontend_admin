import {
    Add as AddIcon,
    Block as BlockIcon,
    ContentCopy as CopyIcon,
    LocationOn as LocationIcon,
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {
    Alert,
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
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    Snackbar,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import ActivationKeyDisplay from '../components/common/ActivationKeyDisplay';
import { ActivationKey, apiService } from '../services/api';

interface CreateActivationKeyRequest {
  assignedTo: {
    email: string;
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
  };
  validUntil: string;
  maxUses: number;
  notes?: string;
  requireLocation: boolean;
}

const roles = [
  'doctor',
  'nurse', 
  'technician',
  'inspector',
  'supervisor'
];

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function ActivationKeys() {
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ActivationKey | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Form state for creating new keys
  const [formData, setFormData] = useState<CreateActivationKeyRequest>({
    assignedTo: {
      email: '',
      fullName: '',
      role: '',
      facility: '',
      state: '',
      contactInfo: '',
      location: {
        latitude: 0,
        longitude: 0,
        address: ''
      }
    },
    validUntil: '',
    maxUses: 1,
    notes: '',
    requireLocation: true
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Partial<CreateActivationKeyRequest>>({});

  // Build validation errors (pure)
  const buildErrors = (f: CreateActivationKeyRequest): { errors: any, valid: boolean } => {
    const errors: any = {};

    if (!f.assignedTo.fullName.trim()) {
      if (!errors.assignedTo) errors.assignedTo = {};
      errors.assignedTo.fullName = 'Full name is required';
    }

    if (!f.assignedTo.email.trim()) {
      if (!errors.assignedTo) errors.assignedTo = {};
      errors.assignedTo.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(f.assignedTo.email)) {
      if (!errors.assignedTo) errors.assignedTo = {};
      errors.assignedTo.email = 'Email is invalid';
    }

    if (!f.assignedTo.role) {
      if (!errors.assignedTo) errors.assignedTo = {};
      errors.assignedTo.role = 'Role is required';
    }

    if (!f.assignedTo.facility.trim()) {
      if (!errors.assignedTo) errors.assignedTo = {};
      errors.assignedTo.facility = 'Facility is required';
    }

    if (!f.assignedTo.state) {
      if (!errors.assignedTo) errors.assignedTo = {};
      errors.assignedTo.state = 'State is required';
    }

    if (!f.assignedTo.contactInfo.trim()) {
      if (!errors.assignedTo) errors.assignedTo = {};
      errors.assignedTo.contactInfo = 'Contact information is required';
    }

    if (!f.validUntil) {
      errors.validUntil = 'Valid until date is required';
    }

    if (f.requireLocation && (!f.assignedTo.location.latitude || !f.assignedTo.location.longitude)) {
      if (!errors.assignedTo) errors.assignedTo = {};
      if (!errors.assignedTo.location) errors.assignedTo.location = {};
      errors.assignedTo.location.latitude = 'Location coordinates are required';
    }

    const valid = Object.keys(errors).length === 0;
    return { errors, valid };
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            assignedTo: {
              ...prev.assignedTo,
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: prev.assignedTo.location.address
              }
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setSnackbar({
            open: true,
            message: 'Failed to get current location. Please enter coordinates manually.',
            severity: 'warning'
          });
        }
      );
    } else {
      setSnackbar({
        open: true,
        message: 'Geolocation is not supported by this browser.',
        severity: 'warning'
      });
    }
  };

  // Fetch activation keys
  const fetchKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getActivationKeys({
        page: pagination.page + 1,
        limit: pagination.limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      });

      if (response.success && response.data) {
        // Transform backend data to match frontend interface
        const transformedKeys = response.data.activationKeys.map((backendKey: any) => ({
          keyId: backendKey._id,
          activationKey: backendKey.key,
          shortCode: backendKey.key?.substring(0, 4) || 'N/A',
          userId: backendKey.activatedBy?._id || backendKey.assignedTo?.userId || 'N/A',
          deviceId: backendKey.deviceId || 'Not activated',
          role: backendKey.assignedTo?.role || 'N/A',
          facility: backendKey.assignedTo?.facility || 'N/A',
          state: backendKey.assignedTo?.state || 'N/A',
          validityMonths: 12, // Default value
          issuedAt: backendKey.createdAt,
          expiresAt: backendKey.validUntil,
          status: backendKey.status,
          isUsed: backendKey.usageCount > 0,
          usedAt: backendKey.activatedAt,
          createdBy: {
            adminId: backendKey.createdBy?._id || 'N/A',
            adminName: backendKey.createdBy?.firstName + ' ' + backendKey.createdBy?.lastName || 'Admin',
            adminEmail: backendKey.createdBy?.email || 'admin@nso.gov.ng'
          },
          notes: backendKey.notes || '',
          adminNotes: backendKey.adminNotes || ''
        }));

        setKeys(transformedKeys);
        
        // Safely set pagination total
        const total = response.data.pagination?.total || transformedKeys.length;
        setPagination(prev => ({
          ...prev,
          total: total
        }));
      } else {
        setError('Failed to fetch activation keys');
        setKeys([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      console.error('Error fetching activation keys:', err);
      setError('Failed to fetch activation keys');
      setKeys([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  // Load keys on component mount and when dependencies change
  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Handle pagination change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  // Handle menu operations
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, key: ActivationKey) => {
    setAnchorEl(event.currentTarget);
    setSelectedKey(key);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedKey(null);
  };

  // Handle key creation
  const handleCreateKey = async () => {
    const { errors, valid } = buildErrors(formData);
    setFormErrors(errors);
    if (!valid) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields correctly.',
        severity: 'warning'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await apiService.createActivationKey(formData);

      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Activation key created successfully!',
          severity: 'success'
        });
        
        // Reset form and close dialog
        setFormData({
          assignedTo: {
            email: '',
            fullName: '',
            role: '',
            facility: '',
            state: '',
            contactInfo: '',
            location: {
              latitude: 0,
              longitude: 0,
              address: ''
            }
          },
          validUntil: '',
          maxUses: 1,
          notes: '',
          requireLocation: true
        });
        setIsCreateDialogOpen(false);
        
        // Move to first page so the newest key (sorted by createdAt desc) is visible
        setPagination(prev => ({ ...prev, page: 0 }));
        // fetchKeys will be triggered by useEffect due to pagination change
      } else {
        const errorMessage = response.error || response.message || 'Unknown error occurred';
        console.error('Activation key creation failed:', response);
        setSnackbar({
          open: true,
          message: `Failed to create key: ${errorMessage}`,
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error creating activation key:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Network error occurred';
      setSnackbar({
        open: true,
        message: `Failed to create activation key: ${errorMessage}`,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key revocation
  const handleRevokeKey = async (keyId: string, reason?: string) => {
    if (!keyId) {
      setSnackbar({
        open: true,
        message: 'Invalid key ID',
        severity: 'error'
      });
      return;
    }
    
    try {
      const response = await apiService.revokeActivationKey(keyId, reason);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Activation key revoked successfully',
          severity: 'success'
        });
        await fetchKeys();
      } else {
        setSnackbar({
          open: true,
          message: `Failed to revoke key: ${response.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error revoking key:', error);
      setSnackbar({
        open: true,
        message: 'Failed to revoke activation key',
        severity: 'error'
      });
    }
    handleMenuClose();
  };

  // Copy key to clipboard
  const handleCopyKey = (key: string) => {
    if (!key) {
      setSnackbar({
        open: true,
        message: 'No key to copy',
        severity: 'warning'
      });
      return;
    }
    
    navigator.clipboard.writeText(key).then(() => {
      setSnackbar({
        open: true,
        message: 'Activation key copied to clipboard',
        severity: 'success'
      });
    }).catch((err) => {
      console.error('Failed to copy to clipboard:', err);
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error'
      });
    });
  };

  // Enhanced copy functionality with fallback
  const handleCopyToClipboard = async (text: string, label: string) => {
    if (!text) {
      setSnackbar({
        open: true,
        message: `No ${label.toLowerCase()} to copy`,
        severity: 'warning'
      });
      return;
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setSnackbar({
        open: true,
        message: `${label} copied to clipboard!`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error'
      });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'used':
        return 'info';
      case 'expired':
        return 'warning';
      case 'revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  // Filter keys based on search and status
  const filteredKeys = keys.filter(key => {
    // Add null checks to prevent toLowerCase() errors
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (key.activationKey?.toLowerCase() || '').includes(searchLower) ||
      (key.userId?.toLowerCase() || '').includes(searchLower) ||
      (key.role?.toLowerCase() || '').includes(searchLower) ||
      (key.facility?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Activation Keys
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate activation keys for mobile app users. Users will create their profiles when they activate the app.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
            sx={{ minWidth: 150 }}
          >
            Generate Key
          </Button>
        </Box>

        {/* Activation Flow Info */}
        <Card sx={{ mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              How Activation Works
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              When you generate an activation key, the user will:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                • Copy the activation key from the admin panel
              </Typography>
              <Typography variant="body2">
                • Paste it into the mobile app activation screen
              </Typography>
              <Typography variant="body2">
                • Create their profile with location and contact information
              </Typography>
              <Typography variant="body2">
                • Automatically appear in the Users section once activated
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Keys"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by key, user, role, or facility..."
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="used">Used</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                    <MenuItem value="revoked">Revoked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchKeys}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Keys Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role & Facility</TableCell>
                        <TableCell>Activation Key</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Expires</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredKeys.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                              No activation keys found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredKeys.map((key) => (
                          <TableRow key={key.keyId || `key-${Math.random()}`} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {key.userId || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {key.role || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {key.facility || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {key.state || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            
                            <TableCell>
                              <ActivationKeyDisplay
                                activationKey={key.activationKey || ''}
                                shortCode={key.shortCode}
                                compact={true}
                                onCopy={handleCopyToClipboard}
                              />
                            </TableCell>
                            
                            <TableCell>
                              <Chip
                                label={key.status || 'unknown'}
                                color={getStatusColor(key.status || 'unknown') as any}
                                size="small"
                              />
                            </TableCell>
                            
                            <TableCell>
                              <Typography variant="body2">
                                {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </TableCell>
                            
                            <TableCell>
                              <Typography variant="body2">
                                {key.issuedAt ? new Date(key.issuedAt).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </TableCell>
                            
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, key)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={pagination.total}
                  rowsPerPage={pagination.limit}
                  page={pagination.page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Key Dialog */}
        <Dialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Generate New Activation Key</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.assignedTo.fullName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    assignedTo: { ...prev.assignedTo, fullName: e.target.value }
                  }))}
                  error={!!formErrors.assignedTo?.fullName}
                  helperText={formErrors.assignedTo?.fullName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.assignedTo.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    assignedTo: { ...prev.assignedTo, email: e.target.value }
                  }))}
                  error={!!formErrors.assignedTo?.email}
                  helperText={formErrors.assignedTo?.email}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required error={!!formErrors.assignedTo?.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.assignedTo.role}
                    label="Role"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assignedTo: { ...prev.assignedTo, role: e.target.value }
                    }))}
                  >
                    {roles.map(role => (
                      <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.assignedTo?.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {formErrors.assignedTo.role}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Facility"
                  value={formData.assignedTo.facility}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    assignedTo: { ...prev.assignedTo, facility: e.target.value }
                  }))}
                  error={!!formErrors.assignedTo?.facility}
                  helperText={formErrors.assignedTo?.facility}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.assignedTo.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    assignedTo: { ...prev.assignedTo, state: e.target.value }
                  }))}
                  error={!!formErrors.assignedTo?.state}
                  helperText={formErrors.assignedTo?.state}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Information"
                  value={formData.assignedTo.contactInfo}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    assignedTo: { ...prev.assignedTo, contactInfo: e.target.value }
                  }))}
                  error={!!formErrors.assignedTo?.contactInfo}
                  helperText={formErrors.assignedTo?.contactInfo}
                  required
                />
              </Grid>

                             <Grid item xs={12} md={6}>
                 <FormControlLabel
                   control={
                     <Switch
                       checked={formData.requireLocation}
                       onChange={(e) => setFormData(prev => ({
                         ...prev,
                         requireLocation: e.target.checked
                       }))}
                       name="requireLocation"
                       color="primary"
                     />
                   }
                   label="Require User to Provide Location"
                 />
               </Grid>

               <Grid item xs={12} md={6}>
                 <Button
                   fullWidth
                   variant="outlined"
                   startIcon={<LocationIcon />}
                   onClick={getCurrentLocation}
                   disabled={!formData.requireLocation}
                 >
                   Get Current Location
                 </Button>
               </Grid>

              {formData.requireLocation && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      type="number"
                      value={formData.assignedTo.location.latitude}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        assignedTo: {
                          ...prev.assignedTo,
                          location: { ...prev.assignedTo.location, latitude: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      error={!!formErrors.assignedTo?.location?.latitude}
                      helperText={formErrors.assignedTo?.location?.latitude}
                      InputProps={{
                        endAdornment: <LocationIcon sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      type="number"
                      value={formData.assignedTo.location.longitude}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        assignedTo: {
                          ...prev.assignedTo,
                          location: { ...prev.assignedTo.location, longitude: parseFloat(e.target.value) || 0 }
                        }
                      }))}
                      error={!!formErrors.assignedTo?.location?.longitude}
                      helperText={formErrors.assignedTo?.location?.longitude}
                      InputProps={{
                        endAdornment: <LocationIcon sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address (Optional)"
                      value={formData.assignedTo.location.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        assignedTo: {
                          ...prev.assignedTo,
                          location: { ...prev.assignedTo.location, address: e.target.value }
                        }
                      }))}
                      placeholder="e.g., 123 Main St, Abuja"
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Valid Until"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    validUntil: e.target.value
                  }))}
                  error={!!formErrors.validUntil}
                  helperText={formErrors.validUntil}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Uses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    maxUses: parseInt(e.target.value) || 1
                  }))}
                  required
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Optional notes about this activation key..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateKey}
              variant="contained"
              disabled={loading || !(() => {
                const { valid } = buildErrors(formData);
                return valid;
              })()}
            >
              {loading ? <CircularProgress size={20} /> : 'Generate Key'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Key Dialog */}
        <Dialog
          open={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Activation Key Details</DialogTitle>
          <DialogContent>
            {selectedKey && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <ActivationKeyDisplay
                    activationKey={selectedKey.activationKey || ''}
                    shortCode={selectedKey.shortCode}
                    keyId={selectedKey.keyId}
                    status={selectedKey.status}
                    expiresAt={selectedKey.expiresAt}
                    remainingDays={selectedKey.expiresAt ? Math.ceil((new Date(selectedKey.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : undefined}
                    showFullKey={true}
                    onCopy={handleCopyToClipboard}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">{selectedKey.userId || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1">{selectedKey.role || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Facility
                  </Typography>
                  <Typography variant="body1">{selectedKey.facility || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    State
                  </Typography>
                  <Typography variant="body1">{selectedKey.state || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedKey.status || 'unknown'}
                    color={getStatusColor(selectedKey.status || 'unknown') as any}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expires
                  </Typography>
                  <Typography variant="body1">
                    {selectedKey.expiresAt ? new Date(selectedKey.expiresAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>

                {selectedKey?.status === 'used' && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Patient Activity Analytics
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Charts below show medical activities performed by the user who activated this key.
                      </Typography>
                      {/* Lazy import to avoid bundle bloat */}
                      {/* @ts-ignore - dynamic import at runtime */}
                      {(() => {
                        const MedicalChartsPanel = require('../components/charts/MedicalChartsPanel').default;
                        return <MedicalChartsPanel userId={selectedKey?.userId} />;
                      })()}
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            setIsViewDialogOpen(true);
            handleMenuClose();
          }}>
            <ViewIcon sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          
          {selectedKey?.status === 'active' && (
            <MenuItem onClick={() => handleRevokeKey(selectedKey.keyId || '', 'Admin revocation')}>
              <BlockIcon sx={{ mr: 1 }} />
              Revoke Key
            </MenuItem>
          )}
          
          <MenuItem onClick={() => handleCopyToClipboard(selectedKey?.activationKey || '', 'Activation Key')}>
            <CopyIcon sx={{ mr: 1 }} />
            Copy Activation Key
          </MenuItem>
          
          {selectedKey?.shortCode && (
            <MenuItem onClick={() => handleCopyToClipboard(selectedKey.shortCode, 'Short Code')}>
              <CopyIcon sx={{ mr: 1 }} />
              Copy Short Code
            </MenuItem>
          )}
        </Menu>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Box>
  );
}
