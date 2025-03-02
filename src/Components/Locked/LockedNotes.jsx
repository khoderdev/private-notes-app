import React, { useContext } from "react";

import LockedNote from "./LockedNote";
import { DataContext } from "../../Context/DataProvider";

import { Box, Typography, Container, Grid } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const LockedNotes = () => {
  const { lockedNotes, setLockedNotes } = useContext(DataContext);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = reorder(
      lockedNotes,
      result.source.index,
      result.destination.index
    );
    setLockedNotes(items);
  };

  return (
    <React.Fragment>
      {lockedNotes.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "5rem",
          }}
        >
          <LockOutlined
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
            Locked notes you add appear here
          </Typography>
        </Box>
      ) : (
        <Container maxWidth="lg">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <Grid
                  spacing={2}
                  container
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {lockedNotes.map((note, index) => (
                    <Draggable
                      key={note.id}
                      draggableId={note.id}
                      index={index}
                    >
                      {(provided) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <LockedNote note={note} />
                        </Grid>
                      )}
                    </Draggable>
                  ))}
                </Grid>
              )}
            </Droppable>
          </DragDropContext>
        </Container>
      )}
    </React.Fragment>
  );
};

export default LockedNotes;
