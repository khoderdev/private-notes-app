import React from 'react';
import { Typography, IconButton } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SyncIcon from '@mui/icons-material/Sync';
import RefreshIcon from '@mui/icons-material/Refresh';
import { StatusIndicator } from '../styles/note';

const SyncStatusIndicator = ({ syncStatus, onRetry }) => {
  switch (syncStatus) {
    case 'online':
      return (
        <StatusIndicator sx={{ color: 'success.main' }}>
          <CloudDoneIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">Cloud Sync Active</Typography>
        </StatusIndicator>
      );
    
    case 'offline':
      return (
        <StatusIndicator
          sx={{ color: 'text.secondary' }}
          onClick={onRetry}
        >
          <CloudOffIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">Offline Mode</Typography>
          <IconButton size="small" color="inherit" sx={{ ml: 1 }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </StatusIndicator>
      );
    
    case 'error':
      return (
        <StatusIndicator
          sx={{ color: 'error.main' }}
          onClick={onRetry}
        >
          <CloudOffIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">Sync Error</Typography>
          <IconButton size="small" color="inherit" sx={{ ml: 1 }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </StatusIndicator>
      );
    
    case 'syncing':
      return (
        <StatusIndicator sx={{ color: 'info.main' }}>
          <SyncIcon
            fontSize="small"
            sx={{ mr: 1, animation: 'spin 2s linear infinite' }}
          />
          <Typography variant="body2">Syncing...</Typography>
        </StatusIndicator>
      );
    
    default:
      return null;
  }
};

export default SyncStatusIndicator;
