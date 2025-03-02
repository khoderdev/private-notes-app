import React, { useContext, useState, useEffect } from "react";

import TrashNote from "./TrashNote";

import { DataContext } from "../../Context/DataProvider";

import {
  Box,
  Typography,
  Grid,
  Container,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";

import { DeleteOutlineOutlined } from "@mui/icons-material";

const TrashNotes = () => {
  const { deletedNotes, emptyTrashHandler } = useContext(DataContext);

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const emptyTrash = () => {
    emptyTrashHandler();
    handleCloseModal();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const filteredNotes = deletedNotes.filter(
        (note) => now - note.createdAt <= 7 * 24 * 60 * 60 * 1000
      );
      if (filteredNotes.length !== deletedNotes.length) {
        // Only update if there's a change
        emptyTrashHandler(filteredNotes);
      }
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedNotes]);

  return (
    <React.Fragment>
      {deletedNotes && deletedNotes.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "8rem",
          }}
        >
          <DeleteOutlineOutlined
            sx={{
              backgroundSize: "120px 120px",
              height: "120px",
              margin: "20px",
              opacity: ".1",
              width: "120px",
            }}
          />
          <Typography
            sx={{ fontSize: "1.375rem" }}
            align="center"
            variant="h6"
            color="#5f6368"
          >
            No notes in Trash
          </Typography>
        </Box>
      ) : (
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            <Button
              variant="text"
              color="error"
              onClick={handleOpenModal}
              sx={{ textTransform: "none" }}
            >
              Empty Trash
            </Button>
          </Box>
          <Grid container spacing={2}>
            {deletedNotes && deletedNotes.map((trashNote) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={trashNote.id}>
                <TrashNote trashNote={trashNote} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Empty trash?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={emptyTrash}
            color="error"
            variant="contained"
          >
            Empty Trash
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default TrashNotes;
