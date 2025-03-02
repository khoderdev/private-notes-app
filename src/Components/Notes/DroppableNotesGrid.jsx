import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Grid } from "@mui/material";
import DraggableNoteItem from "./DraggableNoteItem";

const DroppableNotesGrid = ({ notes, draggedNoteId }) => (
  <Droppable droppableId="droppable" direction="horizontal">
    {(provided, snapshot) => (
      <Grid
        container
        spacing={3}
        ref={provided.innerRef}
        {...provided.droppableProps}
        sx={{
          transition: "background-color 0.2s ease",
          backgroundColor: snapshot.isDraggingOver
            ? "rgba(0, 0, 0, 0.02)"
            : "transparent",
          borderRadius: "8px",
          padding: snapshot.isDraggingOver ? 1 : 0,
        }}
      >
        {notes.map((note, index) => (
          <DraggableNoteItem
            key={note.id}
            note={note}
            index={index}
            draggedNoteId={draggedNoteId}
          />
        ))}
        {provided.placeholder}
      </Grid>
    )}
  </Droppable>
);

export default DroppableNotesGrid;
