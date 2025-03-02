import { useState, useContext } from "react";
import { v4 as uuid } from "uuid";
import { DataContext } from "../Context/DataProvider";

const emptyNote = {
  id: "",
  title: "",
  text: "",
  isLocked: false,
  password: "",
};

export const useNoteForm = () => {
  const [showTextField, setShowTextField] = useState(false);
  const [addNote, setAddNote] = useState({ ...emptyNote, id: uuid() });
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isClickAwayEnabled, setIsClickAwayEnabled] = useState(true);

  const { setNotes } = useContext(DataContext);

  const onTextChange = (e) => {
    let changedNote = { ...addNote, [e.target.name]: e.target.value };
    setAddNote(changedNote);
  };

  const handleLockNote = () => {
    // Disable ClickAway while the lock dialog is open
    setIsClickAwayEnabled(false);
    setShowLockDialog(true);
  };

  const handleCloseLockDialog = () => {
    // Re-enable ClickAway after the dialog is closed
    setIsClickAwayEnabled(true);
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

    if (password.length < 2) {
      setPasswordError("Password must be at least 2 characters");
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
    // Re-enable ClickAway after the dialog is closed
    setIsClickAwayEnabled(true);
  };

  const handleSaveNote = (containerRef) => {
    if (!isClickAwayEnabled) return;
    
    setShowTextField(false);
    if (containerRef.current) {
      containerRef.current.style.minHeight = "30px";
    }

    const newNote = { ...addNote, id: uuid() };
    
    // Reset the form state after creating the note
    setAddNote({ ...emptyNote, id: uuid() });

    if (newNote.title || newNote.text) {
      setNotes((prevArr) => [newNote, ...prevArr]);
    }
  };

  const handleNoteFieldFocus = (containerRef) => {
    setShowTextField(true);
    if (containerRef.current) {
      containerRef.current.style.minHeight = "70px";
    }
  };

  return {
    showTextField,
    addNote,
    showLockDialog,
    password,
    confirmPassword,
    showPassword,
    passwordError,
    isClickAwayEnabled,
    onTextChange,
    handleLockNote,
    handleCloseLockDialog,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleTogglePasswordVisibility,
    handleSaveLock,
    handleSaveNote,
    handleNoteFieldFocus
  };
};
