import React from "react";
import { ClickAwayListener, Container as MuiContainer } from "@mui/material";
import { useNoteForm } from "../../hooks/useNoteForm";
import NoteFormContent from "./NoteFormContent";

const Form = () => {
  const {
    note,
    showTextField,
    onTextChange,
    handleClickAway,
    toggleLock,
    containerRef
  } = useNoteForm();

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <MuiContainer maxWidth="sm">
        <NoteFormContent
          containerRef={containerRef}
          showTextField={showTextField}
          note={note}
          onTextChange={onTextChange}
          handleToggleLock={toggleLock}
        />
      </MuiContainer>
    </ClickAwayListener>
  );
};

export default Form;
