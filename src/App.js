import React from 'react';
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CircularProgress, Typography, Button, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState, useContext } from "react";

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

function App() {
  const { loading, user, authEnabled } = useFirebaseAuth();
  const [appReady, setAppReady] = useState(false);
  const { firebaseError } = useContext(DataContext);

  useEffect(() => {
    // Set app as ready once Firebase auth is initialized
    if (!loading) {
      setAppReady(true);
    }
  }, [loading]);

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
          {(!authEnabled || user?.isLocalUser) && (
            <Alert 
              severity="info" 
              sx={{ 
                margin: '16px', 
                marginBottom: 0,
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
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
            >
              <Typography variant="body1" component="div">
                There was an issue connecting to the cloud. Your notes are being saved locally.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {user ? 'We\'ll try to sync when the connection is restored.' : 'Sign in to enable cloud sync.'}
              </Typography>
            </Alert>
          )}
          <Box sx={{ p: 3, width: "100%" }}>
            <DrawerHeader />
            <Routes>
              <Route path="/" element={
                <>
                  <Form />
                  <Notes />
                </>
              } />
              <Route path="/archive" element={<Archive />} />
              <Route path="/trash" element={<Trash />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </Box>
  );
}

export default App;
