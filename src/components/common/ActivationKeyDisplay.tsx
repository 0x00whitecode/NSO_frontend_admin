import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Chip,
  Card,
  CardContent,
  Grid,
  Button
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon
} from '@mui/icons-material';

interface ActivationKeyDisplayProps {
  activationKey: string;
  shortCode?: string;
  keyId?: string;
  status?: string;
  expiresAt?: string;
  remainingDays?: number;
  showFullKey?: boolean;
  onCopy?: (text: string, label: string) => void;
  compact?: boolean;
}

const ActivationKeyDisplay: React.FC<ActivationKeyDisplayProps> = ({
  activationKey,
  shortCode,
  keyId,
  status,
  expiresAt,
  remainingDays,
  showFullKey = false,
  onCopy,
  compact = false
}) => {
  const [isKeyVisible, setIsKeyVisible] = useState(showFullKey);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

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
      
      const message = `${label} copied to clipboard!`;
      setSnackbar({
        open: true,
        message,
        severity: 'success'
      });

      // Call parent onCopy if provided
      if (onCopy) {
        onCopy(text, label);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  if (compact) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={() => handleCopyToClipboard(activationKey, 'Activation Key')}
            title="Click to copy activation key"
          >
            {isKeyVisible ? activationKey : maskKey(activationKey)}
          </Typography>
          <Tooltip title={isKeyVisible ? "Hide key" : "Show key"}>
            <IconButton
              size="small"
              onClick={() => setIsKeyVisible(!isKeyVisible)}
            >
              {isKeyVisible ? <HideIcon fontSize="small" /> : <ViewIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy activation key">
            <IconButton
              size="small"
              onClick={() => handleCopyToClipboard(activationKey, 'Activation Key')}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {shortCode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Short Code: {shortCode}
            </Typography>
            <Tooltip title="Copy short code">
              <IconButton
                size="small"
                onClick={() => handleCopyToClipboard(shortCode, 'Short Code')}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
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

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Activation Key</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {status && (
                  <Chip
                    label={status}
                    color={getStatusColor(status) as any}
                    size="small"
                  />
                )}
                <Tooltip title={isKeyVisible ? "Hide key" : "Show key"}>
                  <IconButton
                    size="small"
                    onClick={() => setIsKeyVisible(!isKeyVisible)}
                  >
                    {isKeyVisible ? <HideIcon /> : <ViewIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                wordBreak: 'break-all',
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'grey.200'
                }
              }}
              onClick={() => handleCopyToClipboard(activationKey, 'Activation Key')}
              title="Click to copy activation key"
            >
              {isKeyVisible ? activationKey : maskKey(activationKey)}
              <Box sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                opacity: 0.7,
                '&:hover': {
                  opacity: 1
                }
              }}>
                <CopyIcon fontSize="small" />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                startIcon={<CopyIcon />}
                onClick={() => handleCopyToClipboard(activationKey, 'Activation Key')}
                variant="outlined"
                size="small"
              >
                Copy Activation Key
              </Button>
              
              {shortCode && (
                <Button
                  startIcon={<CopyIcon />}
                  onClick={() => handleCopyToClipboard(shortCode, 'Short Code')}
                  variant="outlined"
                  size="small"
                >
                  Copy Short Code
                </Button>
              )}
            </Box>
          </Grid>

          {(keyId || expiresAt || remainingDays !== undefined) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {keyId && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Key ID</Typography>
                    <Typography variant="body2">{keyId}</Typography>
                  </Box>
                )}
                
                {expiresAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Expires</Typography>
                    <Typography variant="body2">
                      {new Date(expiresAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                
                {remainingDays !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Remaining Days</Typography>
                    <Typography variant="body2">{remainingDays}</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
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
      </CardContent>
    </Card>
  );
};

export default ActivationKeyDisplay;
