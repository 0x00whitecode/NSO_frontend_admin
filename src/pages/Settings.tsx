import {
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    Save as SaveIcon,
    Security as SecurityIcon,
    Settings as SystemIcon,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Divider,
    FormControlLabel,
    Grid,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    // Profile settings
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // System settings
    autoSync: true,
    syncInterval: 5,
    maxRetries: 3,
    enableLogging: true,
    logLevel: 'info',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    syncAlerts: true,
    errorAlerts: true,
    weeklyReports: false,
    
    // Security settings
    sessionTimeout: 30,
    requireMFA: false,
    allowMultipleSessions: true,
    ipWhitelist: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (section: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${section} settings saved successfully!`);
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const tabs = [
    { label: 'Profile', icon: <PersonIcon /> },
    { label: 'System', icon: <SystemIcon /> },
    { label: 'Notifications', icon: <NotificationsIcon /> },
    { label: 'Security', icon: <SecurityIcon /> },
  ];

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
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure system preferences and account settings
          </Typography>
        </Box>
      </motion.div>

      {/* Settings Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition="start"
                  sx={{ minHeight: 64 }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Profile Settings */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Profile Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    mr: 3,
                    fontSize: '2rem',
                  }}
                >
                  {user?.name?.charAt(0) || 'A'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label={user?.role?.replace('_', ' ').toUpperCase()}
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={settings.name}
                    onChange={handleSettingChange('name')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={settings.email}
                    onChange={handleSettingChange('email')}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Change Password
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    value={settings.currentPassword}
                    onChange={handleSettingChange('currentPassword')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    value={settings.newPassword}
                    onChange={handleSettingChange('newPassword')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    value={settings.confirmPassword}
                    onChange={handleSettingChange('confirmPassword')}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave('Profile')}
                >
                  Save Profile
                </Button>
              </Box>
            </Box>
          </TabPanel>

          {/* System Settings */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                System Configuration
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSync}
                        onChange={handleSettingChange('autoSync')}
                      />
                    }
                    label="Enable Automatic Sync"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Sync Interval (minutes)"
                    value={settings.syncInterval}
                    onChange={handleSettingChange('syncInterval')}
                    disabled={!settings.autoSync}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Retry Attempts"
                    value={settings.maxRetries}
                    onChange={handleSettingChange('maxRetries')}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableLogging}
                        onChange={handleSettingChange('enableLogging')}
                      />
                    }
                    label="Enable System Logging"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave('System')}
                >
                  Save System Settings
                </Button>
              </Box>
            </Box>
          </TabPanel>

          {/* Notification Settings */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Notification Preferences
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={handleSettingChange('emailNotifications')}
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={handleSettingChange('pushNotifications')}
                      />
                    }
                    label="Push Notifications"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.syncAlerts}
                        onChange={handleSettingChange('syncAlerts')}
                      />
                    }
                    label="Sync Status Alerts"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.errorAlerts}
                        onChange={handleSettingChange('errorAlerts')}
                      />
                    }
                    label="Error Alerts"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.weeklyReports}
                        onChange={handleSettingChange('weeklyReports')}
                      />
                    }
                    label="Weekly Reports"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave('Notification')}
                >
                  Save Notification Settings
                </Button>
              </Box>
            </Box>
          </TabPanel>

          {/* Security Settings */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ maxWidth: 600 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Security Configuration
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                These settings affect system security. Please review carefully before making changes.
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Session Timeout (minutes)"
                    value={settings.sessionTimeout}
                    onChange={handleSettingChange('sessionTimeout')}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireMFA}
                        onChange={handleSettingChange('requireMFA')}
                      />
                    }
                    label="Require Multi-Factor Authentication"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowMultipleSessions}
                        onChange={handleSettingChange('allowMultipleSessions')}
                      />
                    }
                    label="Allow Multiple Sessions"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="IP Whitelist (one per line)"
                    value={settings.ipWhitelist}
                    onChange={handleSettingChange('ipWhitelist')}
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave('Security')}
                  color="error"
                >
                  Save Security Settings
                </Button>
              </Box>
            </Box>
          </TabPanel>
        </Card>
      </motion.div>
    </Box>
  );
}
