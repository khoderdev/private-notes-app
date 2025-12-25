import { useEffect, useState, useContext } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Snackbar, Alert, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";

import Header from "./Components/Header/Sidebar/Sidebar";
import Notes from "./Components/Notes/Notes";
import Archive from "./Components/Archive/Archives";
import Trash from "./Components/Trash/TrashNotes";
import AuthForm from "./Components/Auth/AuthForm";
import { DataContext } from "./Context/DataProvider";
import LoadingIndicator from "../src/utils/LoadingIndicator";
import SyncStatusIndicator from "../src/utils/SyncStatusIndicator";
import AlertManager from "../src/utils/AlertManager";

const DrawerHeader = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

function App() {
  const {
    firebaseError,
    firestoreEnabled,
    retryFirebaseConnection,
    user,
    authEnabled,
    loading: dataLoading,
  } = useContext(DataContext);

  const [appReady, setAppReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState("offline");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [quotaResetTime, setQuotaResetTime] = useState(null);

  useEffect(() => {
    if (!dataLoading) {
      setAppReady(true);
    }
  }, [dataLoading]);

  useEffect(() => {
    if (firestoreEnabled && authEnabled && user && !user.isLocalUser) {
      setSyncStatus("online");
    } else if (firebaseError) {
      setSyncStatus("error");
    } else {
      setSyncStatus("offline");
    }
  }, [firestoreEnabled, authEnabled, user, firebaseError]);

  const handleRetryConnection = async () => {
    setSyncStatus("syncing");
    setShowSnackbar(true);
    setSnackbarMessage("Attempting to reconnect to Firebase...");

    try {
      const firestoreSuccess = await retryFirebaseConnection();
      if (firestoreSuccess) {
        setShowSnackbar(true);
        setSnackbarMessage("Successfully reconnected to Firebase!");
        setSyncStatus("online");
      } else {
        setShowSnackbar(true);
        setSnackbarMessage(
          "Failed to connect to Firestore. Your notes are still saved locally."
        );
        setSyncStatus("offline");
      }
    } catch (error) {
      console.error("Error during retry:", error);
      setShowSnackbar(true);
      setSnackbarMessage("Error reconnecting: " + error.message);
      setSyncStatus("error");
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  if (dataLoading || !appReady) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Box style={{ display: "flex", width: "100%" }}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Header />
        <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
              padding: "8px 0",
            }}
          >
            <SyncStatusIndicator
              syncStatus={syncStatus}
              onRetry={handleRetryConnection}
            />
          </Box>

          <AlertManager
            quotaExceeded={false}
            authEnabled={authEnabled}
            user={user}
            firebaseError={firebaseError}
            syncStatus={syncStatus}
            onRetry={handleRetryConnection}
            quotaResetTime={quotaResetTime}
          />

          <Box sx={{ width: "100%", flex: 1, overflow: "auto" }}>
            <DrawerHeader />
            <Routes>
              <Route path="/" element={<Notes />} />
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          sx={{ width: "100%" }}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
