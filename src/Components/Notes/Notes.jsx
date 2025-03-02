import { useContext, useState } from "react";
import { Box, styled, useTheme, useMediaQuery, Container } from "@mui/material";
import { DragDropContext } from "@hello-pangea/dnd";
import { DataContext } from "../../Context/DataProvider";
import { EmptyNotes } from "./EmptyNotes";
import DroppableNotesGrid from "./DroppableNotesGrid";

const DrawerHeader = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

const NotesContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(1),
  width: "100%",
  minHeight: "calc(100vh - 500px)",
  maxWidth: "1600px",
  backgroundColor: "#f5f5f5",
  margin: "0 auto",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  [theme.breakpoints.up("sm")]: {
    // padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.background.default,
  minHeight: "calc(100vh - 64px)",
  transition: "background-color 0.3s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  // backgroundColor: "red",
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    <MainContent>
      <DrawerHeader />
      <NotesContainer maxWidth="xl" disableGutters={isMobile}>
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
