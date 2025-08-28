import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Timeline as ActivityIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Key as KeyIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
  badge?: string | number;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <PeopleIcon />,
    path: '/users',
    permission: 'users.read',
    badge: 'New',
  },
  {
    id: 'activation-keys',
    label: 'Activation Keys',
    icon: <KeyIcon />,
    path: '/activation-keys',
    permission: 'keys.manage',
    badge: 'Offline',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    permission: 'analytics.read',
  },
  {
    id: 'sync',
    label: 'Sync Management',
    icon: <SyncIcon />,
    path: '/sync',
    permission: 'sync.manage',
    badge: 3,
  },
  {
    id: 'activity',
    label: 'Activity Logs',
    icon: <ActivityIcon />,
    path: '/activity',
    permission: 'activity.read',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    permission: 'settings.write',
  },
];

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return user?.permissions.includes(permission) || user?.role === 'super_admin';
  };

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 280 : 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 280 : 80,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          borderRight: 'none',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: open ? 3 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-start' : 'center',
          minHeight: 80,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Avatar
            sx={{
              width: open ? 48 : 40,
              height: open ? 48 : 40,
              bgcolor: '#3b82f6',
              fontSize: open ? '1.5rem' : '1.2rem',
            }}
          >
            {/* AdminIcon was removed, so this will cause an error if not replaced */}
            <AdminIcon />
          </Avatar>
        </motion.div>
        
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ marginLeft: 16 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              NSO Admin
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Healthcare Management
            </Typography>
          </motion.div>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* User Info */}
      {open && user && (
        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#10b981',
                fontSize: '0.9rem',
                mr: 2,
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={user.role.replace('_', ' ').toUpperCase()}
            size="small"
            sx={{
              bgcolor: user.role === 'super_admin' ? '#ef4444' : '#3b82f6',
              color: 'white',
              fontSize: '0.7rem',
              height: 20,
            }}
          />
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 2 }}>
        {filteredMenuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ListItem disablePadding sx={{ px: open ? 2 : 1, mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: open ? 2 : 1.5,
                    bgcolor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                    '&:hover': {
                      bgcolor: isActive 
                        ? 'rgba(59, 130, 246, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? '#3b82f6' : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  {open && (
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#3b82f6' : 'rgba(255,255,255,0.9)',
                        },
                      }}
                    />
                  )}
                  
                  {open && item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        bgcolor: typeof item.badge === 'number' ? '#ef4444' : '#10b981',
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20,
                        minWidth: 20,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </motion.div>
          );
        })}
      </List>

      {/* Footer */}
      {open && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.5)',
              display: 'block',
              textAlign: 'center',
            }}
          >
            NSO Admin Dashboard v1.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}
