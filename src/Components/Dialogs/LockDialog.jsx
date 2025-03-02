// LockDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const LockDialog = ({
  showLockDialog,
  handleCloseLockDialog,
  password,
  confirmPassword,
  showPassword,
  passwordError,
  handlePasswordChange,
  handleConfirmPasswordChange,
  handleTogglePasswordVisibility,
  handleLock,
}) => (
  <Dialog open={showLockDialog} onClose={handleCloseLockDialog}>
    <DialogTitle>Lock Note with Password</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        variant="outlined"
        value={password}
        onChange={handlePasswordChange}
        error={!!passwordError}
        helperText={
          passwordError
            ? passwordError
            : "Password must be at least 4 characters"
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        margin="dense"
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        variant="outlined"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        error={!!passwordError}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseLockDialog}>Cancel</Button>
      <Button
        onClick={handleLock}
        variant="contained"
        disabled={!password || !confirmPassword || !!passwordError}
      >
        Lock Note
      </Button>
    </DialogActions>
  </Dialog>
);

export default LockDialog;
