import { useState, useContext } from "react";
import { DataContext } from "../Context/DataProvider";

export const useNoteHandlers = (note) => {
  const [showActions, setShowActions] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Context
  const { notes, setNotes, setArchivedNotes, setDeletedNotes } =
    useContext(DataContext);

  // Handlers
  const archiveNote = (note) => {
    const updatedNotes = notes.filter((data) => data.id !== note.id);
    setNotes(updatedNotes);
    setArchivedNotes((prevArr) => [...prevArr, note]);
  };

  const deleteNote = (note) => {
    const updatedNotes = notes.filter((data) => data.id !== note.id);
    setNotes(updatedNotes);
    setDeletedNotes((prevArr) => [...prevArr, note]);
  };

  const lockNote = () => {
    setShowLockDialog(true);
  };

  const unlockNote = () => {
    setShowUnlockDialog(true);
  };

  const handleCloseLockDialog = () => {
    setShowLockDialog(false);
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handleCloseUnlockDialog = () => {
    setShowUnlockDialog(false);
    setUnlockPassword("");
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

  const handleUnlockPasswordChange = (e) => {
    setUnlockPassword(e.target.value);
    setPasswordError("");
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLock = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }

    const updatedNote = {
      ...note,
      isLocked: true,
      password: password,
    };

    const updatedNotes = notes.map((n) => (n.id === note.id ? updatedNote : n));
    setNotes(updatedNotes);
    setShowLockDialog(false);
    setPassword("");
    setConfirmPassword("");
    setIsUnlocked(false);
  };

  const handleUnlock = () => {
    if (unlockPassword === note.password) {
      setIsUnlocked(true);
      setShowUnlockDialog(false);
      setUnlockPassword("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleRemoveLock = () => {
    const updatedNote = {
      ...note,
      isLocked: false,
      password: "",
    };

    const updatedNotes = notes.map((n) => (n.id === note.id ? updatedNote : n));
    setNotes(updatedNotes);
    setIsUnlocked(false);
  };

  const handleLockAgain = () => {
    setIsUnlocked(false);
  };

  return {
    showActions,
    setShowActions,
    showLockDialog,
    showUnlockDialog,
    password,
    confirmPassword,
    unlockPassword,
    showPassword,
    passwordError,
    isUnlocked,
    archiveNote,
    deleteNote,
    lockNote,
    unlockNote,
    handleCloseLockDialog,
    handleCloseUnlockDialog,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleUnlockPasswordChange,
    handleTogglePasswordVisibility,
    handleLock,
    handleUnlock,
    handleRemoveLock,
    handleLockAgain,
  };
};
