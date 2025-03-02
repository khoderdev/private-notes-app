import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

export const NoteCard = styled(Card)(({ isDragging }) => ({
  boxShadow: isDragging ? "0 5px 10px rgba(0, 0, 0, 0.2)" : "none",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  transition: "all 0.2s ease",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  "&:hover": {
    boxShadow:
      "0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149)",
  },
}));

export const LockedNoteCard = styled(Card)(({ isDragging }) => ({
  boxShadow: isDragging ? "0 5px 10px rgba(0, 0, 0, 0.2)" : "none",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  backgroundColor: "#f5f5f5",
  transition: "all 0.2s ease",
  height: "100%",
  minHeight: "200px", // Ensures all cards have at least this height
  display: "flex",
  flexDirection: "column",
  position: "relative",
  "&:hover": {
    boxShadow:
      "0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149)",
  },
}));

export const UnlockedNoteCard = styled(Card)(({ isDragging }) => ({
  boxShadow: isDragging ? "0 5px 10px rgba(0, 0, 0, 0.2)" : "none",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  transition: "all 0.2s ease",
  height: "100%",
  minHeight: "200px", // Ensures all cards have at least this height
  display: "flex",
  flexDirection: "column",
  position: "relative",
  "&:hover": {
    boxShadow:
      "0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149)",
  },
}));

export const DragHandle = styled("div")(({ theme }) => ({
  position: "absolute",
  top: "5px",
  right: "5px",
  opacity: 0,
  transition: "opacity 0.2s ease",
  color: theme.palette.text.secondary,
  cursor: "grab",
  zIndex: 10,
  "&:active": {
    cursor: "grabbing",
  },
}));

export const NoteContainer = styled("div")({
  position: "relative",
  height: "100%",
  "&:hover .drag-handle": {
    opacity: 0.5,
  },
});
