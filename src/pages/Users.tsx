import {
    Add as AddIcon,
    Block as BlockIcon,
    ContentCopy as CopyIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Map as MapIcon,
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    TableChart as TableIcon,
    Visibility as ViewIcon
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
    Menu,
    MenuItem,
    Select,
    Snackbar,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import UserMap from '../components/common/UserMap';

import { apiService, User as ApiUser } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  facility: string;
  state: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  deviceId: string;
  registeredAt: string;
  avatar?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  contactInfo?: string;
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

// No mock data - all data comes from backend API

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit'>('view');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    console.log('fetchUsers called');
    try {
      setLoading(true);

      const response = await apiService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: selectedTab === 0 ? 'all' : selectedTab === 1 ? 'active' : 'inactive'
      });

      if (response.success) {
        // Transform API data to match our User interface
        const transformedUsers = response.data.users.map((apiUser: ApiUser) => ({
          id: apiUser.userId,
          name: apiUser.fullName,
          email: apiUser.email,
          role: apiUser.role,
          facility: apiUser.facility,
          state: apiUser.state,
          status: apiUser.isActive && apiUser.deviceInfo.isActivated ? 'active' : 'inactive',
          lastLogin: apiUser.deviceInfo.activatedAt || new Date().toISOString(),
          deviceId: apiUser.deviceInfo.deviceId,
          registeredAt: apiUser.registeredAt || new Date().toISOString(),
          latitude: apiUser.location?.latitude || 0,
          longitude: apiUser.location?.longitude || 0,
          address: apiUser.location?.address || '',
          contactInfo: apiUser.contactInfo || '',
          activationKeyInfo: apiUser.activationKeyInfo
        }));

        setUsers(transformedUsers);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      } else {
        // Fallback to empty array on error
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      // Fallback to empty array on error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, selectedTab]);

  // Load users on component mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, searchTerm, selectedTab]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleOpenDialog = (type: 'view' | 'edit', user?: User) => {
    setDialogType(type);
    setSelectedUser(user || null);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  // Enhanced copy functionality
  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
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



  // Add user status management functions
  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended', reason?: string) => {
    try {
      setLoading(true);
      const response = await apiService.updateUserStatus(userId, newStatus === 'active', reason);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: `User status updated to ${newStatus}`,
          severity: 'success'
        });
        await fetchUsers();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update user status: ' + response.error,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update user status. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await apiService.deleteUser(userId);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
        await fetchUsers();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete user: ' + response.error,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete user. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  const handleEditUser = async (userData: Partial<User>) => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      const response = await apiService.updateUser(selectedUser.id, userData);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
        await fetchUsers();
        handleCloseDialog();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update user: ' + response.error,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update user. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  // Memoize filtered users to prevent unnecessary re-renders
  const filteredUsers = useMemo(() => {
    console.log('filteredUsers recalculated:', { usersCount: users.length, searchTerm });
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.facility.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Memoize stats to prevent unnecessary re-renders
  const userStats = useMemo(() => {
    console.log('userStats recalculated:', { usersCount: users.length });
    return [
      { label: 'Total Users', value: users.length, color: '#3b82f6' },
      { label: 'Active Users', value: users.filter(u => u.status === 'active').length, color: '#10b981' },
      { label: 'Inactive Users', value: users.filter(u => u.status === 'inactive').length, color: '#f59e0b' },
      { label: 'Suspended Users', value: users.filter(u => u.status === 'suspended').length, color: '#ef4444' },
    ];
  }, [users]);

  // Memoize columns to prevent unnecessary re-renders
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'user',
      headerName: 'User',
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              mr: 2,
              fontSize: '0.875rem',
            }}
          >
            {params.row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'facility',
      headerName: 'Facility',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.state}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value) as any}
          variant="filled"
        />
      ),
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          onClick={(e) => handleMenuOpen(e, params.row)}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ], []);

  // Memoize tab labels to prevent unnecessary re-renders
  const tabLabels = useMemo(() => ['All Users', 'Active', 'Inactive', 'Suspended'], []);

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
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View users who have activated their accounts through activation keys
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<MapIcon />}
              onClick={() => setViewMode(viewMode === 'table' ? 'map' : 'table')}
              sx={{ minWidth: 150 }}
            >
              {viewMode === 'table' ? 'Map View' : 'Table View'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => window.location.href = '/activation-keys'}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:head': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Generate Activation Key
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {userStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent sx={{ p: 0 }}>
            {/* Toolbar */}
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TextField
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ width: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* View Toggle */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={viewMode === 'table' ? 'contained' : 'outlined'}
                    startIcon={<TableIcon />}
                    onClick={() => setViewMode('table')}
                    size="small"
                  >
                    Table View
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'contained' : 'outlined'}
                    startIcon={<MapIcon />}
                    onClick={() => setViewMode('map')}
                    size="small"
                  >
                    Map View
                  </Button>
                </Box>
              </Box>

              {/* Tabs */}
              <Tabs
                value={selectedTab}
                onChange={(_, newValue) => setSelectedTab(newValue)}
                sx={{ mt: 2 }}
              >
                {tabLabels.map((label, index) => (
                  <Tab key={index} label={label} />
                ))}
              </Tabs>
            </Box>

            {/* Content Area */}
            {loading ? (
              <Box sx={{ height: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ height: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No Users Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Users will appear here once they activate their accounts using activation keys.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    To create new users:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      1. Go to the Activation Keys section
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      2. Generate an activation key with user details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      3. Share the key with the user
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      4. User activates the app and creates their profile
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => window.location.href = '/activation-keys'}
                    sx={{ mt: 3 }}
                  >
                    Generate Activation Key
                  </Button>
                </Box>
              </Box>
            ) : viewMode === 'table' ? (
              /* Data Grid */
              <Box sx={{ height: 600 }}>
                <DataGrid
                  rows={filteredUsers}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: pagination.limit },
                    },
                  }}
                  pageSizeOptions={[10, 25, 50]}
                  paginationMode="server"
                  rowCount={pagination.total}
                  paginationModel={{
                    page: pagination.page - 1,
                    pageSize: pagination.limit,
                  }}
                  onPaginationModelChange={(model) => {
                    handlePageChange(model.page + 1);
                    if (model.pageSize !== pagination.limit) {
                      handlePageSizeChange(model.pageSize);
                    }
                  }}
                  loading={loading}
                  disableRowSelectionOnClick
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    },
                  }}
                />
              </Box>
            ) : (
              /* Map View */
              <Box sx={{ height: 600, p: 2 }}>
                <UserMap users={filteredUsers} height="100%" />
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenDialog('view', selectedUser!)}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('edit', selectedUser!)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem 
          onClick={() => selectedUser && handleUpdateUserStatus(
            selectedUser.id, 
            selectedUser.status === 'suspended' ? 'active' : 'suspended',
            selectedUser.status === 'suspended' ? 'User reactivated' : 'User suspended'
          )}
        >
          <BlockIcon sx={{ mr: 1 }} />
          {selectedUser?.status === 'suspended' ? 'Reactivate User' : 'Suspend User'}
        </MenuItem>
        <MenuItem 
          onClick={() => selectedUser && handleDeleteUser(selectedUser.id)} 
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* User Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
                <DialogTitle>
          {dialogType === 'edit' ? 'Edit User' : 'User Details'}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={selectedUser.name}
                    disabled={dialogType === 'view'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={selectedUser.email}
                    disabled={dialogType === 'view'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={dialogType === 'view'}>
                    <InputLabel>Role</InputLabel>
                    <Select value={selectedUser.role} label="Role">
                      <MenuItem value="Doctor">Doctor</MenuItem>
                      <MenuItem value="Nurse">Nurse</MenuItem>
                      <MenuItem value="Medical Officer">Medical Officer</MenuItem>
                      <MenuItem value="Healthcare Worker">Healthcare Worker</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Facility"
                    value={selectedUser.facility}
                    disabled={dialogType === 'view'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={selectedUser.state}
                    disabled={dialogType === 'view'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={dialogType === 'view'}>
                    <InputLabel>Status</InputLabel>
                    <Select value={selectedUser.status} label="Status">
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {selectedUser.activationKeyInfo && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        Activation Key Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Key ID"
                        value={selectedUser.activationKeyInfo.keyId || 'N/A'}
                        disabled
                        InputProps={{
                          endAdornment: selectedUser.activationKeyInfo.keyId ? (
                            <Tooltip title="Copy Key ID">
                              <IconButton
                                onClick={() => handleCopyToClipboard(selectedUser.activationKeyInfo!.keyId, 'Key ID')}
                                size="small"
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : null,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Short Code"
                        value={selectedUser.activationKeyInfo.shortCode || 'N/A'}
                        disabled
                        InputProps={{
                          endAdornment: selectedUser.activationKeyInfo.shortCode ? (
                            <Tooltip title="Copy Short Code">
                              <IconButton
                                onClick={() => handleCopyToClipboard(selectedUser.activationKeyInfo!.shortCode, 'Short Code')}
                                size="small"
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : null,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Key Status"
                        value={selectedUser.activationKeyInfo.status || 'N/A'}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Remaining Days"
                        value={selectedUser.activationKeyInfo.remainingDays !== undefined ? selectedUser.activationKeyInfo.remainingDays : 'N/A'}
                        disabled
                      />
                    </Grid>
                    {selectedUser.activationKeyInfo.expiresAt && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Expires At"
                          value={new Date(selectedUser.activationKeyInfo.expiresAt).toLocaleDateString()}
                          disabled
                        />
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
                    {(
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            {dialogType !== 'view' && (
              <Button 
                variant="contained" 
                onClick={() => selectedUser && handleEditUser({
                  name: selectedUser.name,
                  email: selectedUser.email,
                  role: selectedUser.role,
                  facility: selectedUser.facility,
                  state: selectedUser.state,
                  status: selectedUser.status
                })}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>

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
    </Box>
  );
}
