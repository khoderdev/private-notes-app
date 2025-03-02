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
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";

const NoteFormLockDialog = ({
  showLockDialog,
  handleCloseLockDialog,
  password,
  confirmPassword,
  showPassword,
  passwordError,
  handlePasswordChange,
  handleConfirmPasswordChange,
  handleTogglePasswordVisibility,
  handleSaveLock,
}) => {
  return (
    <Dialog
      open={showLockDialog}
      onClose={handleCloseLockDialog}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          overflow: "hidden",
          minWidth: "400px",
        },
      }}
    >
      <DialogTitle>Lock Note with Password</DialogTitle>
      <DialogContent sx={{ padding: "24px", paddingTop: "20px" }}>
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
          sx={{
            marginBottom: 2,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: (theme) => theme.palette.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderWidth: "1px",
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  sx={{
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
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
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: (theme) => theme.palette.primary.main,
              },
              "&.Mui-focused fieldset": {
                borderWidth: "1px",
              },
            },
          }}
        />
      </DialogContent>
      <DialogActions
        sx={{
          padding: "16px 24px",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Button
          onClick={handleCloseLockDialog}
          sx={{
            fontWeight: 500,
            textTransform: "none",
            transition: "background-color 0.3s ease",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveLock}
          variant="contained"
          disabled={!password || !confirmPassword || !!passwordError}
          sx={{
            fontWeight: 500,
            textTransform: "none",
            borderRadius: "8px",
            padding: "6px 16px",
            boxShadow: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          Lock Note
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteFormLockDialog;
