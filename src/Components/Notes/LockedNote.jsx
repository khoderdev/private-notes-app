import React from "react";
import { CardActions, CardContent, Button, Typography } from "@mui/material";
import {
  LockOutlined,
  LockOpenOutlined,
  DragIndicator,
} from "@mui/icons-material";
import { NoteContainer, DragHandle, LockedNoteCard } from "../../styles/note";

const LockedNote = ({ isdragging, setShowActions, unlockNote }) => (
  <NoteContainer>
    <DragHandle className="drag-handle">
      <DragIndicator fontSize="small" />
    </DragHandle>
    <LockedNoteCard
      isdragging={isdragging}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent
        sx={{
          wordWrap: "break-word",
          textAlign: "center",
          padding: "30px 15px",
        }}
      >
        <LockOutlined sx={{ fontSize: 40, color: "#5f6368", mb: 1 }} />
        <Typography variant="body1" color="#5f6368">
          This note is locked
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "auto",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<LockOpenOutlined />}
          onClick={unlockNote}
        >
          Unlock
        </Button>
      </CardActions>
    </LockedNoteCard>
  </NoteContainer>
);

export default LockedNote;
