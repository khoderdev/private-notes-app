import React, { useState, useContext } from "react";

import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { UnarchiveOutlined, DeleteOutlineOutlined } from "@mui/icons-material";

import { DataContext } from "../../Context/DataProvider";

const ArchiveCard = styled(Card)`
  box-shadow: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const Archive = ({ archiveNote }) => {
  const [showActions, setShowActions] = useState(false);

  const { 
    unarchiveNoteHandler, 
    deleteNoteHandler,
    archiveNotes 
  } = useContext(DataContext);

  const unarchiveNote = (note) => {
    unarchiveNoteHandler(note);
  };

  const deleteNote = (note) => {
    deleteNoteHandler(note);
  };

  return (
    <ArchiveCard
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent sx={{ wordWrap: "break-word" }}>
        <Typography>{archiveNote.heading}</Typography>
        <Typography>{archiveNote.text}</Typography>
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Unarchive">
          <IconButton
            sx={{ visibility: showActions ? "visible" : "hidden" }}
            onClick={() => unarchiveNote(archiveNote)}
          >
            <UnarchiveOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            sx={{ visibility: showActions ? "visible" : "hidden" }}
            onClick={() => deleteNote(archiveNote)}
          >
            <DeleteOutlineOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </ArchiveCard>
  );
};

export default Archive;
