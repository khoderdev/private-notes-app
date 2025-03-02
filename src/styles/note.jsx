import { Card, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

// Base card styling to ensure consistency across all card types
const baseCardStyles = {
  borderRadius: "10px",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  minHeight: "220px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "visible",
};

// Common hover effect for all cards
const hoverEffect = {
  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15), 0 3px 3px rgba(0, 0, 0, 0.08)",
  transform: "translateY(-2px)",
};

// Dragging effect for all cards
const draggingEffect = {
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2), 0 6px 6px rgba(0, 0, 0, 0.1)",
  transform: "scale(1.03)",
  zIndex: 100,
};

export const NoteCard = styled(Card)(({ isDragging }) => ({
  ...baseCardStyles,
  border: "1px solid #e0e0e0",
  backgroundColor: "#ffffff",
  boxShadow: isDragging
    ? draggingEffect.boxShadow
    : "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)",
  transform: isDragging ? draggingEffect.transform : "scale(1)",
  "&:hover": {
    ...hoverEffect,
  },
}));

export const LockedNoteCard = styled(Card)(({ isDragging }) => ({
  ...baseCardStyles,
  border: "1px solid #e0e0e0",
  backgroundColor: "#f8f9fa",
  backgroundImage: "linear-gradient(to bottom right, #f8f9fa, #f1f3f5)",
  boxShadow: isDragging
    ? draggingEffect.boxShadow
    : "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)",
  transform: isDragging ? draggingEffect.transform : "scale(1)",
  "&:hover": {
    ...hoverEffect,
  },
}));

export const UnlockedNoteCard = styled(Card)(({ isDragging }) => ({
  ...baseCardStyles,
  border: "1px solid #e0e0e0",
  backgroundColor: "#ffffff",
  boxShadow: isDragging
    ? draggingEffect.boxShadow
    : "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)",
  transform: isDragging ? draggingEffect.transform : "scale(1)",
  "&:hover": {
    ...hoverEffect,
  },
}));

export const DragHandle = styled("div")(({ theme }) => ({
  position: "absolute",
  top: "8px",
  right: "8px",
  opacity: 0,
  transition: "opacity 0.2s ease, transform 0.2s ease",
  color: theme.palette.text.secondary,
  cursor: "grab",
  zIndex: 10,
  "&:active": {
    cursor: "grabbing",
    transform: "scale(1.1)",
  },
}));

export const NoteContainer = styled("div")({
  position: "relative",
  height: "100%",
  width: "100%",
  display: "flex",
  "&:hover .drag-handle": {
    opacity: 0.7,
  },
});

export const Container = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  boxShadow:
    "0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%)",
  padding: "15px 20px",
  borderRadius: "10px",
  borderColor: "#e0e0e0",
  margin: "auto",
  marginBottom: "2rem",
  minHeight: "30px",
  transition: "box-shadow 0.3s ease",
  backgroundColor: "red",
  width: "100%",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12), 0 2px 10px rgba(0, 0, 0, 0.08)",
  },
}));

export const ActionsContainer = styled(Box)(() => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  marginTop: "10px",
  padding: "4px 0",
  opacity: 0.8,
  transition: "opacity 0.2s ease",
  "&:hover": {
    opacity: 1,
  },
}));
