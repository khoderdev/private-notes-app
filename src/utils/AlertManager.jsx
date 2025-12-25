import React from 'react';
import { Alert, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const AlertManager = ({
  quotaExceeded,
  authEnabled,
  user,
  firebaseError,
  syncStatus,
  onRetry,
  quotaResetTime
}) => {
  return (
    <>
      {quotaExceeded && (
        <Alert
          severity="warning"
          sx={{
            margin: '16px',
            marginBottom: 0,
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
              disabled={syncStatus === 'syncing'}
            >
              Reset Quota
            </Button>
          }
        >
          <Typography variant="body1" component="div">
            Firebase authentication quota has been exceeded. Your notes are
            being saved locally.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This is a temporary limitation.
            {quotaResetTime ? (
              <>
                {" "}
                Quota will reset in approximately {quotaResetTime.hours}{" "}
                hours and {quotaResetTime.minutes} minutes.
              </>
            ) : (
              <>
                {" "}
                You can try again later or continue using the app in offline
                mode.
              </>
            )}
          </Typography>
        </Alert>
      )}

      {(!authEnabled || user?.isLocalUser) && !quotaExceeded && (
        <Alert
          severity="info"
          sx={{
            margin: '16px',
            marginBottom: 0,
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
              disabled={syncStatus === 'syncing'}
            >
              Retry Connection
            </Button>
          }
        >
          <Typography variant="body1" component="div">
            Running in offline mode. Your notes are being saved locally.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Firebase authentication is currently disabled. All notes will be
            stored in your browser's local storage.
          </Typography>
        </Alert>
      )}

      {firebaseError && authEnabled && !user?.isLocalUser && (
        <Alert
          severity="info"
          sx={{
            margin: '16px',
            marginBottom: 0,
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
              disabled={syncStatus === 'syncing'}
            >
              Retry Connection
            </Button>
          }
        >
          <Typography variant="body1" component="div">
            There was an issue connecting to the cloud. Your notes are being
            saved locally.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {firebaseError?.toLowerCase().includes("permission") || firebaseError?.toLowerCase().includes("denied")
              ? "Your notes are safely stored on your device. Cloud sync is currently unavailable."
              : `Error: ${firebaseError}`}
          </Typography>
        </Alert>
      )}
    </>
  );
};

export default AlertManager;
