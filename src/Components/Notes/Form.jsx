import React, { useRef } from "react";
import { ClickAwayListener, Container as MuiContainer } from "@mui/material";
import { useNoteForm } from "../../hooks/useNoteForm";
import NoteFormContent from "./NoteFormContent";
import NoteFormLockDialog from "../Dialogs/NoteFormLockDialog";

const Form = () => {
  const containerRef = useRef();

  const {
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
    handleNoteFieldFocus,
  } = useNoteForm();

  return (
    <>
      <ClickAwayListener
        onClickAway={() =>
          isClickAwayEnabled ? handleSaveNote(containerRef) : () => {}
        }
      >
        <MuiContainer maxWidth="sm">
          <NoteFormContent
            containerRef={containerRef}
            showTextField={showTextField}
            addNote={addNote}
            onTextChange={onTextChange}
            handleNoteFieldFocus={handleNoteFieldFocus}
            handleLockNote={handleLockNote}
          />
        </MuiContainer>
      </ClickAwayListener>

      <NoteFormLockDialog
        showLockDialog={showLockDialog}
        handleCloseLockDialog={handleCloseLockDialog}
        password={password}
        confirmPassword={confirmPassword}
        showPassword={showPassword}
        passwordError={passwordError}
        handlePasswordChange={handlePasswordChange}
        handleConfirmPasswordChange={handleConfirmPasswordChange}
        handleTogglePasswordVisibility={handleTogglePasswordVisibility}
        handleSaveLock={handleSaveLock}
      />
    </>
  );
};

export default Form;
