import { useContext, useState } from "react";
import {
  Box,
  styled,
  useTheme,
  useMediaQuery,
  Container,
  CircularProgress,
} from "@mui/material";
import { DragDropContext } from "@hello-pangea/dnd";
import { DataContext } from "../../Context/DataProvider";
import { EmptyNotes } from "./EmptyNotes";
import DroppableNotesGrid from "./DroppableNotesGrid";
import Form from "./Form";

const DrawerHeader = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(3),
}));

const NotesContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: 0,
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "80vh",
}));

const Notes = () => {
  const { notes, setNotes, loading, updateNotesOrderHandler } = useContext(DataContext);
  const [draggedNoteId, setDraggedNoteId] = useState(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const onDragStart = (start) => {
    const { draggableId } = start;
    setDraggedNoteId(draggableId);
  };

  const onDragEnd = (result) => {
    setDraggedNoteId(null);

    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Dropped in the same position
    if (sourceIndex === destinationIndex) {
      return;
    }

    const updatedNotes = Array.from(notes);
    const [removed] = updatedNotes.splice(sourceIndex, 1);
    updatedNotes.splice(destinationIndex, 0, removed);

    setNotes(updatedNotes);
    updateNotesOrderHandler(updatedNotes);
  };

  if (loading) {
    return (
      <MainContent>
        <DrawerHeader />
        <LoadingContainer>
          <CircularProgress color="primary" />
        </LoadingContainer>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <DrawerHeader />
      <Form />
      <NotesContainer maxWidth={isSmallScreen ? "xs" : "lg"}>
        {notes.length === 0 ? (
          <EmptyNotes />
        ) : (
          <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
            <DroppableNotesGrid notes={notes} draggedNoteId={draggedNoteId} />
          </DragDropContext>
        )}
      </NotesContainer>
    </MainContent>
  );
};

export default Notes;
