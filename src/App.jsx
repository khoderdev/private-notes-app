import React from 'react';
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CircularProgress, Typography, Button, Alert, Snackbar, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState, useContext } from "react";
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SyncIcon from '@mui/icons-material/Sync';

import Header from "./Components/Header/Sidebar/Sidebar";
import Notes from "./Components/Notes/Notes";
import Form from "./Components/Notes/Form";
import Archive from "./Components/Archive/Archives";
import Trash from "./Components/Trash/TrashNotes";
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";
import { DataContext } from "./Context/DataProvider";

const DrawerHeader = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100vh',
  flexDirection: 'column',
  gap: 2
}));

const StatusIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '0.875rem',
  marginLeft: 'auto',
  marginRight: '16px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  }
}));

function App() {
  const { loading, user, authEnabled, retryAuthentication, authAttempts } = useFirebaseAuth();
  const [appReady, setAppReady] = useState(false);
  const { firebaseError, firestoreEnabled, retryFirebaseConnection } = useContext(DataContext);
  const [syncStatus, setSyncStatus] = useState('offline'); // 'online', 'offline', 'syncing'
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Set app as ready once Firebase auth is initialized
    if (!loading) {
      setAppReady(true);
    }
  }, [loading]);

  useEffect(() => {
    // Update sync status based on Firebase state
    if (firestoreEnabled && authEnabled && user && !user.isLocalUser) {
      setSyncStatus('online');
    } else if (firebaseError) {
      setSyncStatus('error');
    } else {
      setSyncStatus('offline');
    }
  }, [firestoreEnabled, authEnabled, user, firebaseError]);

  const handleRetryConnection = async () => {
    setSyncStatus('syncing');
    setShowSnackbar(true);
    setSnackbarMessage('Attempting to reconnect to Firebase...');
    
    try {
      // First retry authentication if needed
      let authSuccess = true;
      if (!authEnabled || user?.isLocalUser) {
        authSuccess = await retryAuthentication();
      }
      
      // Then retry Firestore connection
      if (authSuccess) {
        const firestoreSuccess = await retryFirebaseConnection();
        
        if (firestoreSuccess) {
          setShowSnackbar(true);
          setSnackbarMessage('Successfully reconnected to Firebase!');
          setSyncStatus('online');
        } else {
          setShowSnackbar(true);
          setSnackbarMessage('Failed to connect to Firestore. Your notes are still saved locally.');
          setSyncStatus('offline');
        }
      } else {
        setShowSnackbar(true);
        setSnackbarMessage('Failed to authenticate with Firebase. Your notes are still saved locally.');
        setSyncStatus('offline');
      }
    } catch (error) {
      console.error('Error during connection retry:', error);
      setShowSnackbar(true);
      setSnackbarMessage('Error reconnecting: ' + error.message);
      setSyncStatus('error');
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const renderSyncStatus = () => {
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
            onClick={handleRetryConnection}
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
            onClick={handleRetryConnection}
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
            <SyncIcon fontSize="small" sx={{ mr: 1, animation: 'spin 2s linear infinite' }} />
            <Typography variant="body2">Syncing...</Typography>
          </StatusIndicator>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress color="primary" />
        <Box sx={{ mt: 2 }}>Loading your notes...</Box>
      </LoadingContainer>
    );
  }

  if (!appReady) {
    return (
      <LoadingContainer>
        <CircularProgress color="primary" />
        <Box sx={{ mt: 2 }}>Loading your notes...</Box>
      </LoadingContainer>
    );
  }

  return (
    <Box style={{ display: "flex", width: "100%" }}>
      <Router>
        <Header />
        <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            padding: '8px 0'
          }}>
            {renderSyncStatus()}
          </Box>
          
          {(!authEnabled || user?.isLocalUser) && (
            <Alert 
              severity="info" 
              sx={{ 
                margin: '16px', 
                marginBottom: 0,
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleRetryConnection}
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
                Firebase authentication is currently disabled. All notes will be stored in your browser's local storage.
              </Typography>
            </Alert>
          )}
          
          {firebaseError && authEnabled && !user?.isLocalUser && (
            <Alert 
              severity="warning" 
              sx={{ 
                margin: '16px', 
                marginBottom: 0,
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleRetryConnection}
                  startIcon={<RefreshIcon />}
                  disabled={syncStatus === 'syncing'}
                >
                  Retry Connection
                </Button>
              }
            >
              <Typography variant="body1" component="div">
                There was an issue connecting to the cloud. Your notes are being saved locally.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Error: {firebaseError}
              </Typography>
            </Alert>
          )}
          
          <Box sx={{ p: 3, width: "100%" }}>
            <DrawerHeader />
            <Routes>
              <Route path="/" element={
                <>
                  <Notes />
                </>
              } />
              <Route path="/archive" element={<Archive />} />
              <Route path="/trash" element={<Trash />} />
            </Routes>
          </Box>
        </Box>
      </Router>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        }
      />
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}

export default App;
