import React from 'react';
import { Box, CircularProgress, Typography, Avatar } from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            mb: 3,
          }}
        >
          <AdminIcon sx={{ fontSize: 40 }} />
        </Avatar>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
          NSO Admin Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', opacity: 0.9 }}>
          Loading healthcare management system...
        </Typography>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <CircularProgress
          size={50}
          thickness={4}
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Typography
          variant="caption"
          sx={{
            mt: 4,
            opacity: 0.7,
            textAlign: 'center',
          }}
        >
          Nigerian Standard Organization
        </Typography>
      </motion.div>
    </Box>
  );
}
