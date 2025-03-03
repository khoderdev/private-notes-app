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
  DialogActions,
  Button,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import {
  DeleteForeverOutlined,
  RestoreFromTrashOutlined,
} from "@mui/icons-material";

import { DataContext } from "../../Context/DataProvider";

const TrashCard = styled(Card)`
  box-shadow: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const TrashNote = ({ trashNote }) => {
  const [showActions, setShowActions] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const { 
    restoreDeletedNoteHandler, 
    deleteDeletedNoteHandler, 
    deletedNotes 
  } = useContext(DataContext);

  const deleteNote = (note) => {
    deleteDeletedNoteHandler(note);
    handleCloseModal();
  };

  const restoreNote = (note) => {
    restoreDeletedNoteHandler(note);
  };

  return (
    <React.Fragment>
      <TrashCard
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <CardContent sx={{ wordWrap: "break-word" }}>
          <Typography>{trashNote.heading}</Typography>
          <Typography>{trashNote.text}</Typography>
        </CardContent>
        <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Tooltip title="Delete forever">
            <IconButton
              sx={{ visibility: showActions ? "visible" : "hidden" }}
              onClick={handleOpenModal}
            >
              <DeleteForeverOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Restore">
            <IconButton
              sx={{ visibility: showActions ? "visible" : "hidden" }}
              onClick={() => restoreNote(trashNote)}
            >
              <RestoreFromTrashOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </TrashCard>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Delete note forever?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={() => deleteNote(trashNote)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default TrashNote;
