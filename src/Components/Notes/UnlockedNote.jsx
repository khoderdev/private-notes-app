import React, { useState } from "react";
import {
  CardActions,
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  Button,
} from "@mui/material";
import {
  ArchiveOutlined,
  DeleteOutlineOutlined,
  LockOutlined,
  LockOpenOutlined,
  DragIndicator,
} from "@mui/icons-material";
import { NoteContainer, DragHandle, UnlockedNoteCard } from "../../styles/note";

const UnlockedNote = ({
  note,
  isdragging,
  setShowActions = () => {}, 
  showActions = false, 
  lockNote,
  handleLockAgain,
  handleRemoveLock,
  archiveNote,
  deleteNote,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localShowActions, setLocalShowActions] = useState(showActions);

  const handleMouseEnter = () => {
    if (setShowActions) {
      setShowActions(true);
    } else {
      setLocalShowActions(true);
    }
  };

  const handleMouseLeave = () => {
    if (setShowActions) {
      setShowActions(false);
    } else {
      setLocalShowActions(false);
    }
  };

  const displayActions = showActions || localShowActions;

  return (
    <NoteContainer>
      <DragHandle className="drag-handle">
        <DragIndicator fontSize="small" />
      </DragHandle>
      <UnlockedNoteCard
        isdragging={isdragging}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent sx={{ width: "100%", wordBreak: "break-word", flex: 1 }}>
          {note.heading && (
            <Typography variant="h6" component="h2" gutterBottom>
              {note.heading}
            </Typography>
          )}
          <Typography
            variant="body1"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              ...(isExpanded ? {} : { WebkitLineClamp: 3 }),
            }}
          >
            {note.text}
          </Typography>
          {note.text && note.text.length > 100 && !isExpanded && (
            <Button onClick={() => setIsExpanded(true)} sx={{ mt: 1 }}>
              Read more
            </Button>
          )}
          {isExpanded && (
            <Button onClick={() => setIsExpanded(false)} sx={{ mt: 1 }}>
              Show less
            </Button>
          )}
        </CardContent>
        <CardActions
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "auto",
            padding: "8px",
          }}
        >
          {note.isLocked ? (
            <Tooltip title="Lock Again">
              <IconButton onClick={handleLockAgain}>
                <LockOpenOutlined fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Lock Note">
              <IconButton
                sx={{ visibility: displayActions ? "visible" : "hidden" }}
                onClick={lockNote}
              >
                <LockOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {note.isLocked && (
            <Tooltip title="Remove Lock">
              <IconButton
                sx={{ visibility: displayActions ? "visible" : "hidden" }}
                onClick={handleRemoveLock}
              >
                <LockOutlined fontSize="small" color="disabled" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Archive">
            <IconButton
              sx={{ visibility: displayActions ? "visible" : "hidden" }}
              onClick={() => archiveNote(note)}
            >
              <ArchiveOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              sx={{ visibility: displayActions ? "visible" : "hidden" }}
              onClick={() => deleteNote(note)}
            >
              <DeleteOutlineOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </UnlockedNoteCard>
    </NoteContainer>
  );
};

export default UnlockedNote;
