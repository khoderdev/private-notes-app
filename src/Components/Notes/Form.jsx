import React, { useState, useRef, useContext } from "react";

import {
  Box,
  Container as MuiContainer,
  ClickAwayListener,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
  Tooltip,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import { v4 as uuid } from "uuid";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";

import { DataContext } from "../../Context/DataProvider";

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
  padding: 10px 15px;
  border-radius: 8px;
  border-color: "#e0e0e0";
  margin: auto;
  margin-bottom: 2rem;
  min-height: 30px;
`;

const ActionsContainer = styled(Box)`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

const note = {
  id: "",
  title: "",
  text: "",
  isLocked: false,
  password: "",
};

const Form = () => {
  const [showTextField, setShowTextField] = useState(false);
  const [addNote, setAddNote] = useState({ ...note, id: uuid() });
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const { setNotes } = useContext(DataContext);

  const containerRef = useRef();

  const onTextChange = (e) => {
    let changedNote = { ...addNote, [e.target.name]: e.target.value };
    setAddNote(changedNote);
  };

  const handleLockNote = () => {
    setShowLockDialog(true);
  };

  const handleCloseLockDialog = () => {
    setShowLockDialog(false);
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (confirmPassword && e.target.value !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (password && e.target.value !== password) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSaveLock = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }

    const lockedNote = {
      ...addNote,
      isLocked: true,
      password: password,
    };

    setAddNote(lockedNote);
    setShowLockDialog(false);
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handleSaveNote = () => {
    setShowTextField(false);
    containerRef.current.style.minHeight = "30px";

    const newNote = { ...addNote, id: uuid() };
    setAddNote({ ...note, id: uuid() });

    if (newNote.title || newNote.text) {
      setNotes((prevArr) => [newNote, ...prevArr]);
    }
  };

  return (
    <>
      <ClickAwayListener onClickAway={handleSaveNote}>
        <MuiContainer maxWidth="sm">
          <Container ref={containerRef}>
            {showTextField && (
              <TextField
                size="small"
                placeholder="Title"
                variant="standard"
                InputProps={{ disableUnderline: true }}
                style={{ marginBottom: 10 }}
                onChange={(e) => onTextChange(e)}
                name="title"
                value={addNote.title}
              />
            )}
            <TextField
              multiline
              placeholder="Take a note..."
              variant="standard"
              InputProps={{ disableUnderline: true }}
              onClick={() => {
                setShowTextField(true);
                containerRef.current.style.minHeight = "70px";
              }}
              onChange={(e) => onTextChange(e)}
              name="text"
              value={addNote.text}
            />
            {showTextField && (
              <ActionsContainer>
                <Tooltip
                  title={
                    addNote.isLocked
                      ? "Note will be locked"
                      : "Lock note with password"
                  }
                >
                  <IconButton
                    onClick={handleLockNote}
                    color={addNote.isLocked ? "primary" : "default"}
                  >
                    <LockOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ActionsContainer>
            )}
          </Container>
        </MuiContainer>
      </ClickAwayListener>

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
            onClick={handleSaveLock}
            variant="contained"
            disabled={!password || !confirmPassword || !!passwordError}
          >
            Lock Note
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Form;
