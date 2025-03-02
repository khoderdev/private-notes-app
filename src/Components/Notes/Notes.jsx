import { useContext, useState } from "react";
import { Box, styled } from "@mui/material";
import { DragDropContext } from "@hello-pangea/dnd";
import { DataContext } from "../../Context/DataProvider";
import { EmptyNotes } from "./EmptyNotes";
import DroppableNotesGrid from "./DroppableNotesGrid";

const DrawerHeader = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

const NotesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  width: "100%",
  transition: "all 0.3s ease",
}));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const Notes = () => {
  const { notes, setNotes } = useContext(DataContext);
  const [draggedNoteId, setDraggedNoteId] = useState(null);

  const onDragEnd = (result) => {
    setDraggedNoteId(null);

    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const updatedNotes = reorder(
      notes,
      result.source.index,
      result.destination.index
    );

    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  const onDragStart = (start) => {
    setDraggedNoteId(start.draggableId);
  };

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Box sx={{ width: "100%" }}>
        <DrawerHeader />
        <NotesContainer>
          {notes.length === 0 ? (
            <EmptyNotes />
          ) : (
            <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
              <DroppableNotesGrid notes={notes} draggedNoteId={draggedNoteId} />
            </DragDropContext>
          )}
        </NotesContainer>
      </Box>
    </Box>
  );
};

export default Notes;
