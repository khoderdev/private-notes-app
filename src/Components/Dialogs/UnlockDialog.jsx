// UnlockDialog.jsx
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

const UnlockDialog = ({
  showUnlockDialog,
  handleCloseUnlockDialog,
  unlockPassword,
  showPassword,
  passwordError,
  handleUnlockPasswordChange,
  handleTogglePasswordVisibility,
  handleUnlock,
}) => (
  <Dialog open={showUnlockDialog} onClose={handleCloseUnlockDialog}>
    <DialogTitle>Unlock Note</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        variant="outlined"
        value={unlockPassword}
        onChange={handleUnlockPasswordChange}
        error={!!passwordError}
        helperText={passwordError}
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
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleUnlock();
          }
        }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseUnlockDialog}>Cancel</Button>
      <Button onClick={handleUnlock} variant="contained">
        Unlock
      </Button>
    </DialogActions>
  </Dialog>
);

export default UnlockDialog;
