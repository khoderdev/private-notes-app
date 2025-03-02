import React, { useState, useContext } from "react";

import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  ArchiveOutlined,
  DeleteOutlineOutlined,
  LockOutlined,
  LockOpenOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { DataContext } from "../../Context/DataProvider";

const NoteCard = styled(Card)`
  box-shadow: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f5f5f5;

  &:hover {
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302),
      0 1px 3px 1px rgba(60, 64, 67, 0.149);
  }
`;

const LockedNoteCard = styled(Card)`
  box-shadow: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;

  &:hover {
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302),
      0 1px 3px 1px rgba(60, 64, 67, 0.149);
  }
`;

const LockedNote = ({ note }) => {
  const [showActions, setShowActions] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const { lockedNotes, setLockedNotes, setArchivedNotes, setDeletedNotes, setNotes } =
    useContext(DataContext);

  const archiveNote = (note) => {
    const updatedNotes = lockedNotes.filter((data) => data.id !== note.id);
    setLockedNotes(updatedNotes);
    setArchivedNotes((prevArr) => [...prevArr, note]);
  };

  const deleteNote = (note) => {
    const updatedNotes = lockedNotes.filter((data) => data.id !== note.id);
    setLockedNotes(updatedNotes);
    setDeletedNotes((prevArr) => [...prevArr, note]);
  };

  const unlockNote = () => {
    setShowUnlockDialog(true);
  };

  const handleCloseUnlockDialog = () => {
    setShowUnlockDialog(false);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleUnlock = () => {
    if (password === note.password) {
      setIsUnlocked(true);
      setShowUnlockDialog(false);
      setPassword("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
  };

  const moveToRegularNotes = () => {
    const updatedNote = { ...note, isLocked: false, password: "" };
    const updatedLockedNotes = lockedNotes.filter((data) => data.id !== note.id);
    setLockedNotes(updatedLockedNotes);
    setNotes((prevArr) => [updatedNote, ...prevArr]);
  };

  return (
    <>
      {isUnlocked ? (
        <LockedNoteCard
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <CardContent sx={{ wordWrap: "break-word" }}>
            <Typography>{note.title}</Typography>
            <Typography>{note.text}</Typography>
          </CardContent>
          <CardActions
            sx={{ display: "flex", justifyContent: "end", marginLeft: "auto" }}
          >
            <Tooltip title="Lock">
              <IconButton
                onClick={handleLock}
              >
                <LockOpenOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Move to Notes">
              <IconButton
                sx={{ visibility: showActions ? "visible" : "hidden" }}
                onClick={moveToRegularNotes}
              >
                <LockOutlined fontSize="small" color="disabled" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Archive">
              <IconButton
                sx={{ visibility: showActions ? "visible" : "hidden" }}
                onClick={() => archiveNote(note)}
              >
                <ArchiveOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                sx={{ visibility: showActions ? "visible" : "hidden" }}
                onClick={() => deleteNote(note)}
              >
                <DeleteOutlineOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </CardActions>
        </LockedNoteCard>
      ) : (
        <NoteCard
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <CardContent sx={{ wordWrap: "break-word", textAlign: "center", padding: "30px 15px" }}>
            <LockOutlined sx={{ fontSize: 40, color: "#5f6368", mb: 1 }} />
            <Typography variant="body1" color="#5f6368">
              This note is locked
            </Typography>
          </CardContent>
          <CardActions
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              variant="outlined"
              startIcon={<LockOpenOutlined />}
              onClick={unlockNote}
            >
              Unlock
            </Button>
          </CardActions>
        </NoteCard>
      )}

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
            value={password}
            onChange={handlePasswordChange}
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
              if (e.key === 'Enter') {
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
    </>
  );
};

export default LockedNote;
