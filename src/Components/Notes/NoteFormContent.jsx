import React from "react";
import { TextField, IconButton, Tooltip, Paper } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { ActionsContainer } from "../../styles/note";

const NoteFormContent = ({
  containerRef,
  showTextField,
  addNote,
  onTextChange,
  handleNoteFieldFocus,
  handleLockNote
}) => {
  return (
    <Paper
      ref={containerRef}
      elevation={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "16px 20px",
        borderRadius: "10px",
        margin: "auto",
        marginBottom: "2rem",
        minHeight: "30px",
        width: "100%",
        transition: "box-shadow 0.3s ease, transform 0.2s ease",
        backgroundColor: "#fff",
        "&:hover": {
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
          transform: "translateY(-1px)",
        },
      }}
    >
      {showTextField && (
        <TextField
          size="small"
          placeholder="Title"
          variant="standard"
          InputProps={{ 
            disableUnderline: true,
            style: { 
              fontSize: '1.1rem',
              fontWeight: 500,
              color: '#202124'
            } 
          }}
          style={{ marginBottom: 12 }}
          onChange={(e) => onTextChange(e)}
          name="title"
          value={addNote.title}
        />
      )}
      <TextField
        multiline
        placeholder="Take a note..."
        variant="standard"
        autoFocus
        InputProps={{ 
          disableUnderline: true,
          style: { 
            fontSize: '0.95rem',
            color: '#5f6368'
          } 
        }}
        onClick={() => handleNoteFieldFocus(containerRef)}
        onChange={(e) => onTextChange(e)}
        name="text"
        value={addNote.text}
        sx={{
          "& .MuiInputBase-root": {
            padding: "4px 0"
          }
        }}
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
              size="small"
              sx={{
                transition: "transform 0.2s ease, color 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  color: addNote.isLocked ? undefined : "#5f6368"
                }
              }}
            >
              <LockOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </ActionsContainer>
      )}
    </Paper>
  );
};

export default NoteFormContent;
