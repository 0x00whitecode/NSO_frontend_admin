import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Brightness4 as DarkModeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
  user: any;
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState('');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const mockNotifications = [
    {
      id: 1,
      title: 'New User Registration',
      message: '5 new users registered in the last hour',
      time: '2 min ago',
      type: 'info',
    },
    {
      id: 2,
      title: 'Sync Alert',
      message: 'Data sync failed for 3 devices',
      time: '15 min ago',
      type: 'warning',
    },
    {
      id: 3,
      title: 'System Update',
      message: 'System maintenance scheduled for tonight',
      time: '1 hour ago',
      type: 'info',
    },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ px: 3, minHeight: '80px !important' }}>
        {/* Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{
            mr: 2,
            bgcolor: 'rgba(0, 0, 0, 0.04)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Healthcare Management Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Monitor and manage NSO mobile app ecosystem
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mr: 3, display: { xs: 'none', md: 'block' } }}>
          <TextField
            size="small"
            placeholder="Search users, activities..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.06)',
                },
                '&.Mui-focused': {
                  bgcolor: 'white',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Refresh Button */}
          <Tooltip title="Refresh Data">
            <IconButton
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationOpen}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' },
              }}
            >
              <Badge badgeContent={mockNotifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Box sx={{ ml: 2 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  p: 0,
                  border: '2px solid transparent',
                  '&:hover': {
                    border: '2px solid rgba(25, 118, 210, 0.3)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.charAt(0) || 'A'}
                </Avatar>
              </IconButton>
            </motion.div>
          </Box>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 280,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {/* User Info */}
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                  mr: 2,
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user?.name || 'Admin User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'admin@nso.gov.ng'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={user?.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
              size="small"
              color="primary"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>

          <Divider />

          {/* Menu Items */}
          <MenuItem onClick={handleProfileMenuClose}>
            <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
            Profile Settings
          </MenuItem>
          
          <MenuItem onClick={handleProfileMenuClose}>
            <SettingsIcon sx={{ mr: 2, color: 'text.secondary' }} />
            Account Settings
          </MenuItem>
          
          <MenuItem onClick={handleProfileMenuClose}>
            <DarkModeIcon sx={{ mr: 2, color: 'text.secondary' }} />
            Dark Mode
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 360,
              maxHeight: 400,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mockNotifications.length} unread notifications
            </Typography>
          </Box>

          {/* Notifications List */}
          {mockNotifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleNotificationClose}
              sx={{
                py: 2,
                px: 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {notification.message}
                </Typography>
              </Box>
            </MenuItem>
          ))}

          {/* Footer */}
          <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 500 }}
            >
              View All Notifications
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
