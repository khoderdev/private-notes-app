import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Grid } from "@mui/material";
import Note from "./Note";

const DraggableNoteItem = ({ note, index, draggedNoteId }) => (
  <Draggable
    key={note.id}
    draggableId={note.id}
    index={index}
    isDragDisabled={note.isLocked && !note.isUnlocked}
  >
    {(provided, snapshot) => (
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
        lg={3}
        xl={2.4}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        sx={{
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: snapshot.isDragging 
            ? "scale(1.03)" 
            : "scale(1)",
          zIndex: snapshot.isDragging ? 100 : 1,
          height: "100%",
          display: "flex",
          padding: 0,
          "&:hover": {
            transform: "translateY(-3px)",
          },
        }}
      >
        <Note
          note={note}
          isDragging={snapshot.isDragging || draggedNoteId === note.id}
        />
      </Grid>
    )}
  </Draggable>
);

export default DraggableNoteItem;
