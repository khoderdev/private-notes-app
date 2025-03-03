import React, { useState, useContext } from "react";
import {
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SyncIcon from "@mui/icons-material/Sync";
import AuthModal from "./AuthModal";
import { useAuth } from "../../hooks/useAuth";
import { DataContext } from "../../Context/DataProvider";

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  backgroundColor: theme.palette.primary.main,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const UserButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: "#1976d2",
  borderRadius: 20,
  padding: theme.spacing(0.5, 2),
  "&:hover": {
    backgroundColor: "#1565c0",
  },
}));

const AuthButton = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { setFirebaseError, setFirestoreEnabled } = useContext(DataContext);
  const {
    user,
    loading,
    signOut,
    retryAuthentication,
    clearQuotaExceededFlag,
    isQuotaExceeded,
  } = useAuth(setFirebaseError, setFirestoreEnabled);
  const quotaExceeded = isQuotaExceeded();

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenAuthModal = () => {
    handleCloseMenu();
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    handleCloseMenu();
    await signOut();
  };

  const handleRetryAuth = async () => {
    handleCloseMenu();
    if (quotaExceeded) {
      clearQuotaExceededFlag();
    }
    await retryAuthentication();
  };

  // If loading, show a loading state
  if (loading) {
    return (
      <UserButton color="inherit" disabled>
        <SyncIcon sx={{ mr: 1, animation: "spin 2s linear infinite" }} />
        <Typography variant="body2">Loading...</Typography>
      </UserButton>
    );
  }

  // If user is not logged in or is using local storage
  if (!user || user.isLocalUser) {
    return (
      <>
        <UserButton
          variant="contained"
          color="inherit"
          onClick={handleOpenAuthModal}
          startIcon={<LoginIcon />}
        >
          Sign In
        </UserButton>

        <AuthModal open={showAuthModal} onClose={handleCloseAuthModal} />
      </>
    );
  }

  // User is logged in
  return (
    <>
      <Tooltip title={user.displayName || user.email || "User Account"}>
        <UserAvatar onClick={handleOpenMenu}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            user.displayName?.charAt(0).toUpperCase() || <PersonIcon />
          )}
        </UserAvatar>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user.displayName || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email || ""}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>

        {user.isLocalUser && (
          <MenuItem onClick={handleRetryAuth}>
            <ListItemIcon>
              <SyncIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Retry Authentication</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <AuthModal open={showAuthModal} onClose={handleCloseAuthModal} />
    </>
  );
};

export default AuthButton;
