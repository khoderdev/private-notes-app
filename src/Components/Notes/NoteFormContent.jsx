import React from "react";
import { TextField, IconButton, Tooltip, Paper, Box } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { ActionsContainer } from "../../styles/note.jsx";

const NoteFormContent = ({
  containerRef,
  showTextField,
  note,
  onTextChange,
  handleToggleLock
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
        backgroundColor: note.color || "#fff",
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
          name="heading"
          value={note.heading}
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
        onClick={() => {
          if (containerRef.current) {
            containerRef.current.style.minHeight = "70px";
          }
        }}
        onChange={(e) => onTextChange(e)}
        name="text"
        value={note.text}
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
              note.locked
                ? "Note will be locked"
                : "Lock note with password"
            }
          >
            <IconButton
              onClick={handleToggleLock}
              color={note.locked ? "primary" : "default"}
              size="small"
              sx={{
                transition: "transform 0.2s ease, color 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  color: note.locked ? undefined : "#5f6368"
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
